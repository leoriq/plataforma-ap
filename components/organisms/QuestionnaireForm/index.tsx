'use client'

import QuestionnaireView from '~/components/molecules/QuestionnaireView'

import styles from './QuestionnaireForm.module.scss'
import FormInput from '~/components/atoms/FormInput'
import Button from '~/components/atoms/Button'
import Dropzone from 'react-dropzone'
import { AnswerType } from '@prisma/client'
import { ChangeEvent, useCallback, useMemo, useState } from 'react'
import {
  QuestionnaireCreateRequest,
  QuestionnaireCreateRequestZod,
} from '~/schemas/QuestionnaireRequest'
import FormTextArea from '~/components/atoms/FormTextArea'
import Image from 'next/image'
import { useModal } from '~/contexts/ModalContext'
import api from '~/utils/api'
import { useRouter } from 'next/navigation'

interface Props {
  lessonId: string
}

interface QuestionFiles {
  questionIndex: number
  audio?: File
  audioUrl?: string
  image?: File
  imageUrl?: string
}

export default function QuestionnaireForm({ lessonId }: Props) {
  const { displayModal, hideModal } = useModal()
  const router = useRouter()

  const [questionnaire, setQuestionnaire] =
    useState<QuestionnaireCreateRequest>({
      lessonId,
      title: '',
      Questions: [],
    })

  const [files, setFiles] = useState<QuestionFiles[]>([])
  const filesMap = useMemo(
    () =>
      new Map<number, QuestionFiles>(files.map((f) => [f.questionIndex, f])),
    [files]
  )

  const questionnaireViewObject = useMemo(() => {
    return {
      id: '',
      ...questionnaire,
      Questions: questionnaire.Questions.map((q, index) => {
        return {
          id: index.toString(),
          imageFileUrl: filesMap.get(index)?.imageUrl,
          audioFileUrl: filesMap.get(index)?.audioUrl,
          ...q,
        }
      }),
    }
  }, [questionnaire, filesMap])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setQuestionnaire((prev) => ({ ...prev, [name]: value }))
    },
    [setQuestionnaire]
  )

  const handleChangeQuestion = useCallback(
    (e: { target: { name: string; value: string } }, index: number) => {
      const { name, value } = e.target
      if (name === 'maxGrade') {
        setQuestionnaire((prev) => ({
          ...prev,
          Questions: prev.Questions.map((q, i) =>
            i === index ? { ...q, [name]: parseInt(value) } : q
          ),
        }))
        return
      }
      if (name === 'answerType') {
        if (value === AnswerType.OPTIONS) {
          setQuestionnaire((prev) => ({
            ...prev,
            Questions: prev.Questions.map((q, i) =>
              i === index ? { ...q, options: ['', ''] } : q
            ),
          }))
        } else {
          setQuestionnaire((prev) => ({
            ...prev,
            Questions: prev.Questions.map((q, i) =>
              i === index ? { ...q, options: [] } : q
            ),
          }))
        }
      }
      setQuestionnaire((prev) => ({
        ...prev,
        Questions: prev.Questions.map((q, i) =>
          i === index ? { ...q, [name]: value } : q
        ),
      }))
    },
    [setQuestionnaire]
  )

  const handleAddQuestion = useCallback(() => {
    setQuestionnaire((prev) => ({
      ...prev,
      Questions: [
        ...prev.Questions,
        {
          title: '',
          maxGrade: 1,
          answerType: AnswerType.TEXT,
          options: [],
          index: prev.Questions.length,
        },
      ],
    }))
  }, [setQuestionnaire])

  const handleRemoveQuestion = useCallback(
    (index: number) => {
      setQuestionnaire((prev) => ({
        ...prev,
        Questions: prev.Questions.filter((_, i) => i !== index),
      }))
      setFiles((prev) => prev.filter((f) => f.questionIndex !== index))
    },
    [setQuestionnaire, setFiles]
  )

  const addImageFile = useCallback(
    (questionIndex: number, file?: File) => {
      setFiles((prev) => {
        const prevFile = prev.find((f) => f.questionIndex === questionIndex)
        return [
          ...prev.filter((f) => f.questionIndex !== questionIndex),
          {
            questionIndex,
            ...prevFile,
            image: file,
            imageUrl: file ? URL.createObjectURL(file) : undefined,
          },
        ]
      })
    },
    [setFiles]
  )

  const addAudioFile = useCallback(
    (questionIndex: number, file?: File) => {
      setFiles((prev) => {
        const prevFile = prev.find((f) => f.questionIndex === questionIndex)
        return [
          ...prev.filter((f) => f.questionIndex !== questionIndex),
          {
            questionIndex,
            ...prevFile,
            audio: file,
            audioUrl: file ? URL.createObjectURL(file) : undefined,
          },
        ]
      })
    },
    [setFiles]
  )

  const handleRemoveOptionFromQuestion = useCallback(
    (questionIndex: number, optionIndex: number) => {
      setQuestionnaire((prev) => {
        return {
          ...prev,
          Questions: prev.Questions.map((q, i) =>
            i === questionIndex
              ? {
                  ...q,
                  options: q.options?.filter((_, i) => i !== optionIndex),
                }
              : q
          ),
        }
      })
    },
    [setQuestionnaire]
  )

  const handleAddOptionToQuestion = useCallback(
    (questionIndex: number) => {
      setQuestionnaire((prev) => {
        return {
          ...prev,
          Questions: prev.Questions.map((q, i) =>
            i === questionIndex
              ? {
                  ...q,
                  options: [...(q.options ?? []), ''],
                }
              : q
          ),
        }
      })
    },
    [setQuestionnaire]
  )

  const handleChangeOption = useCallback(
    (
      e: ChangeEvent<HTMLInputElement>,
      questionIndex: number,
      optionIndex: number
    ) => {
      const { value } = e.target
      setQuestionnaire((prev) => {
        return {
          ...prev,
          Questions: prev.Questions.map((q, i) =>
            i === questionIndex
              ? {
                  ...q,
                  options: q.options?.map((o, i) =>
                    i === optionIndex ? value : o
                  ),
                }
              : q
          ),
        }
      })
    },
    [setQuestionnaire]
  )

  const handleSubmit = useCallback(() => {
    async function createQuestionnaire() {
      try {
        const filesPromisesObj = files.reduce((acc, file) => {
          if (file.audio) {
            const audioFormData = new FormData()
            audioFormData.append('file', file.audio)
            const promise = api.post('/api/upload', audioFormData)
            acc.push({
              promise,
              type: 'audio',
              questionIndex: file.questionIndex,
            })
          }
          if (file.image) {
            const imageFormData = new FormData()
            imageFormData.append('file', file.image)
            const promise = api.post('/api/upload', imageFormData)
            acc.push({
              promise,
              type: 'image',
              questionIndex: file.questionIndex,
            })
          }
          return acc
        }, [] as { promise: Promise<any>; type: 'audio' | 'image'; questionIndex: number; id?: string }[])
        const filesPromises = filesPromisesObj.map((obj) => obj.promise)
        const filesIds = (await Promise.all(filesPromises)).map(
          (response) => response.data.file.id as string
        )
        filesPromisesObj.forEach((obj, index) => {
          obj.id = filesIds[index]
        })
        const filesMap = new Map(
          filesPromisesObj.map((obj) => [
            `${obj.questionIndex}-${obj.type}`,
            obj.id,
          ])
        )

        const questionnaireWithFiles = {
          ...questionnaire,
          Questions: questionnaire.Questions.map((q, index) => {
            return {
              ...q,
              imageFileId: filesMap.get(`${q.index}-image`),
              audioFileId: filesMap.get(`${q.index}-audio`),
            }
          }),
        }

        const response = await api.post(
          '/api/questionnaire',
          questionnaireWithFiles
        )
        const id = response.data.questionnaire.id as string
        router.push(`/auth/material/questionnaire/${id}`)
        hideModal()
      } catch (error) {
        console.log(error)
        displayModal({
          title: 'Error',
          body: 'Something went wrong. Please try again later.',
          buttons: [
            {
              text: 'Ok',
              onClick: hideModal,
            },
          ],
        })
      }
    }
    displayModal({
      title: 'Are you sure?',
      body: 'You wont be able to edit this questionnaire after creation. Please make sure everything is correct.',
      buttons: [
        {
          text: 'Cancel',
          onClick: () => hideModal(),
        },
        {
          text: 'Create',
          color: 'success',
          onClick: createQuestionnaire,
        },
      ],
    })
  }, [questionnaire, files, displayModal, hideModal])

  const errors = useMemo(() => {
    const result = QuestionnaireCreateRequestZod.safeParse(questionnaire)
    if (result.success) return null

    return result.error.format()
  }, [questionnaire])

  return (
    <div className={styles.outerContainer}>
      <div className={styles.formContainer}>
        <h1>Create a Questionnaire</h1>
        <form className={styles.form}>
          <h2>Info</h2>
          <FormInput
            label="Title:"
            name="title"
            onChange={handleChange}
            value={questionnaire.title}
            errors={errors?.title?._errors}
          />

          <h2>Questions</h2>
          {questionnaire.Questions.map((question, index) => (
            <div key={index} className={styles.questionContainer}>
              <h3 className={styles.questionIndex}>Question {index + 1}</h3>
              <FormInput
                label="Max Grade:"
                name={`maxGrade`}
                type="number"
                inputMode="numeric"
                onChange={(e) => handleChangeQuestion(e, index)}
                value={question.maxGrade}
                errors={errors?.Questions?.[index]?.maxGrade?._errors}
              />
              <FormInput
                label="Title:"
                name={`title`}
                onChange={(e) => handleChangeQuestion(e, index)}
                value={question.title}
                errors={errors?.Questions?.[index]?.title?._errors}
              />
              <FormTextArea
                label="Description:"
                name="description"
                onChange={(e) => handleChangeQuestion(e, index)}
                value={question.description}
                errors={errors?.Questions?.[index]?.description?._errors}
              />
              <FormInput
                label="Video Id:"
                name="videoId"
                onChange={(e) => handleChangeQuestion(e, index)}
                value={question.videoId}
                errors={errors?.Questions?.[index]?.videoId?._errors}
              />
              <h4>Image</h4>
              {!filesMap.get(index)?.image ? (
                <Dropzone
                  onDrop={(file) => addImageFile(index, file[0])}
                  accept={{ 'image/*': [] }}
                >
                  {({ getRootProps, getInputProps }) => (
                    <div className={styles.drop} {...getRootProps()}>
                      <input {...getInputProps()} />
                      <p>Drag and drop an image here, or click to select one</p>
                    </div>
                  )}
                </Dropzone>
              ) : (
                <>
                  <div className={styles.imageContainer}>
                    <Image
                      src={filesMap.get(index)?.imageUrl ?? ''}
                      alt="Selected image"
                      fill
                    />
                  </div>
                  <Button
                    type="button"
                    color="danger"
                    onClick={() => addImageFile(index)}
                  >
                    Remove Image
                  </Button>
                </>
              )}
              <h4>Audio</h4>
              {!filesMap.get(index)?.audio ? (
                <Dropzone
                  onDrop={(file) => addAudioFile(index, file[0])}
                  accept={{ 'audio/*': [] }}
                >
                  {({ getRootProps, getInputProps }) => (
                    <div className={styles.drop} {...getRootProps()}>
                      <input {...getInputProps()} />
                      <p>Drag and drop an audio here, or click to select one</p>
                    </div>
                  )}
                </Dropzone>
              ) : (
                <>
                  <audio
                    src={filesMap.get(index)?.audioUrl}
                    controls
                    className={styles.audio}
                  />
                  <Button
                    type="button"
                    color="danger"
                    onClick={() => addAudioFile(index)}
                  >
                    Remove Audio
                  </Button>
                </>
              )}

              <label>
                Answer Type:
                <select
                  className={styles.answerType}
                  name={`answerType`}
                  onChange={(e) => handleChangeQuestion(e, index)}
                  value={question.answerType}
                >
                  <option value={AnswerType.TEXT}>Text</option>
                  <option value={AnswerType.OPTIONS}>Options</option>
                  <option value={AnswerType.AUDIO}>Audio</option>
                </select>
              </label>
              {question.answerType === AnswerType.OPTIONS && (
                <div className={styles.optionsContainer}>
                  {question.options?.map((option, optionIndex) => (
                    <div key={optionIndex} className={styles.optionContainer}>
                      <FormInput
                        label={
                          optionIndex === 0
                            ? 'Right Option:'
                            : `Option ${optionIndex + 1}:`
                        }
                        onChange={(e) =>
                          handleChangeOption(e, index, optionIndex)
                        }
                        value={option}
                        errors={
                          errors?.Questions?.[index]?.options?.[optionIndex]
                            ?._errors
                        }
                      />

                      {optionIndex !== 0 && (
                        <Button
                          type="button"
                          color="danger"
                          onClick={() =>
                            handleRemoveOptionFromQuestion(index, optionIndex)
                          }
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={() => {
                      handleAddOptionToQuestion(index)
                    }}
                  >
                    Add Option
                  </Button>
                </div>
              )}
              <Button
                type="button"
                color="danger"
                onClick={() => handleRemoveQuestion(index)}
              >
                Remove Question {index + 1}
              </Button>
            </div>
          ))}
          <Button type="button" onClick={handleAddQuestion}>
            Add Question
          </Button>

          <Button
            type="submit"
            color="success"
            onClick={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
          >
            Create Questionnaire
          </Button>
        </form>
      </div>

      <div className={styles.previewContainer}>
        <QuestionnaireView questionnaire={questionnaireViewObject} />
      </div>
    </div>
  )
}
