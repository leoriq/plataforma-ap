'use client'

import type { Prisma } from '@prisma/client'
import { useCallback, useState } from 'react'
import api from '~/utils/api'

type QuestionFormData = Omit<
  Prisma.QuestionCreateManyQuestionnaireInput,
  'id' | 'createdAt' | 'updatedAt' | 'options'
> & {
  options?: string[]
  image?: File
  audio?: File
}

interface Props {
  lessonId: string
}

export default function CreateQuestionnaireForm({ lessonId }: Props) {
  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState<QuestionFormData[]>([])

  const handleAddQuestion = useCallback(() => {
    setQuestions((questions) => [
      ...questions,
      { title: '', answerType: 'TEXT', maxGrade: 1 },
    ])
  }, [setQuestions])

  const handleChangeQuestion = useCallback(
    (
      index: number,
      key: keyof QuestionFormData,
      value: string | string[] | File | number
    ) => {
      setQuestions((questions) =>
        questions.map((question, i) =>
          i === index ? { ...question, [key]: value } : question
        )
      )
    },
    [setQuestions]
  )

  const handleAddOption = useCallback(
    (index: number) => {
      setQuestions((questions) =>
        questions.map((question, i) =>
          i === index
            ? question.options
              ? { ...question, options: [...question.options, ''] }
              : { ...question, options: [''] }
            : question
        )
      )
    },
    [setQuestions]
  )

  const handleChangeOption = useCallback(
    (questionIndex: number, optionIndex: number, value: string) => {
      setQuestions((questions) =>
        questions.map((question, i) =>
          i === questionIndex
            ? {
                ...question,
                options: question.options?.map((option, i) =>
                  i === optionIndex ? value : option
                ),
              }
            : question
        )
      )
    },
    [setQuestions]
  )

  const handleSubmit = useCallback(async () => {
    const uploadQuestionFiles = async (question: QuestionFormData) => {
      let imageResponse: Promise<{ data: { file: { id: string } } }> | undefined
      let audioResponse: Promise<{ data: { file: { id: string } } }> | undefined

      if (question.image) {
        const formData = new FormData()
        formData.append('file', question.image)
        formData.append('title', 'questionImage')
        imageResponse = api.post('/api/upload', formData)
        question.image = undefined
      }
      if (question.audio) {
        const formData = new FormData()
        formData.append('file', question.audio)
        formData.append('title', 'questionAudio')
        audioResponse = api.post('/api/upload', formData)
        question.audio = undefined
      }

      question.imageFileId = (await imageResponse)?.data?.file?.id
      question.audioFileId = (await audioResponse)?.data?.file?.id
    }

    await Promise.all(questions.map(uploadQuestionFiles))

    await api.post('/api/questionnaire', {
      title,
      Questions: questions,
      lessonId,
    })
  }, [title, questions, lessonId])

  return (
    <form>
      <label>
        Título:
        <input
          type="text"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <button type="button" onClick={handleAddQuestion}>
        Adicionar questão
      </button>

      {questions.map((question, questionIndex) => (
        <div key={questionIndex}>
          <label>
            Título:
            <input
              type="text"
              name="title"
              value={question.title}
              onChange={(e) =>
                handleChangeQuestion(questionIndex, 'title', e.target.value)
              }
            />
          </label>
          <label>
            Nota máxima:
            <input
              type="number"
              name="maxGrade"
              value={question.maxGrade}
              onChange={(e) =>
                handleChangeQuestion(
                  questionIndex,
                  'maxGrade',
                  parseInt(e.target.value)
                )
              }
            />
          </label>
          <label>
            Descrição:
            <input
              type="text"
              name="description"
              value={question.description || ''}
              onChange={(e) =>
                handleChangeQuestion(
                  questionIndex,
                  'description',
                  e.target.value
                )
              }
            />
          </label>
          <label>
            ID do vídeo:
            <input
              type="text"
              name="videoId"
              value={question.videoUrl || ''}
              onChange={(e) =>
                handleChangeQuestion(questionIndex, 'videoUrl', e.target.value)
              }
            />
          </label>

          <label>
            Imagem:
            <input
              type="file"
              name="imageFileId"
              onChange={(e) =>
                !!e.target.files?.[0] &&
                handleChangeQuestion(
                  questionIndex,
                  'image',
                  e.target.files?.[0]
                )
              }
            />
          </label>
          <label>
            Áudio:
            <input
              type="file"
              name="audioFileId"
              onChange={(e) =>
                !!e.target.files?.[0] &&
                handleChangeQuestion(
                  questionIndex,
                  'audio',
                  e.target.files?.[0]
                )
              }
            />
          </label>

          <label>
            Tipo de resposta:
            <select
              name="answerType"
              value={question.answerType}
              onChange={(e) =>
                handleChangeQuestion(
                  questionIndex,
                  'answerType',
                  e.target.value
                )
              }
            >
              <option value="OPTIONS">Múltipla Escolha</option>
              <option value="AUDIO">Áudio</option>
              <option value="TEXT">Texto</option>
            </select>
          </label>
          {question.answerType === 'OPTIONS' && (
            <div>
              {question.options?.map((option, optionIndex) => (
                <label key={optionIndex}>
                  Opção {optionIndex + 1}:
                  <input
                    type="text"
                    name="option"
                    value={option}
                    onChange={(e) =>
                      handleChangeOption(
                        questionIndex,
                        optionIndex,
                        e.target.value
                      )
                    }
                  />
                </label>
              ))}
              <button
                type="button"
                onClick={() => handleAddOption(questionIndex)}
              >
                Adicionar opção
              </button>
            </div>
          )}
        </div>
      ))}

      <button
        type="submit"
        onClick={(e) => {
          e.preventDefault()
          void handleSubmit()
        }}
      >
        Criar
      </button>
    </form>
  )
}
