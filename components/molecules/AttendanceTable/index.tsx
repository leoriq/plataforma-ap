'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styles from './AttendanceTable.module.scss'
import Button from '~/components/atoms/Button'
import api from '~/utils/api'
import type { MeetingRequest } from '~/schemas/MeetingRequest'
import { useModal } from '~/contexts/ModalContext'
import { useRouter } from 'next/navigation'

interface Props {
  class: {
    id: string
    SynchronousMeeting: {
      id: string
      date: Date
      AttendingStudents: {
        id: string
      }[]
      ExcusedStudents: {
        id: string
      }[]
      AbsentStudents: {
        id: string
      }[]
    }[]
    Students: {
      id: string
      fullName: string | null
      email: string
    }[]
  }
}

export default function AttendanceTable({ class: classObj }: Props) {
  const { displayModal, hideModal } = useModal()
  const router = useRouter()

  const [synchronousMeetings, setSynchronousMeetings] = useState(
    classObj.SynchronousMeeting
  )
  useEffect(() => {
    setSynchronousMeetings(classObj.SynchronousMeeting)
  }, [classObj.SynchronousMeeting])

  const attendedMeetingsByStudentMap = useMemo(
    () =>
      new Map(
        classObj.Students.map((student) => [
          student.id,
          new Set(
            synchronousMeetings.reduce((acc, curr) => {
              if (curr.AttendingStudents.some((s) => s.id === student.id)) {
                return [...acc, curr.id]
              }
              return acc
            }, [] as string[])
          ),
        ])
      ),
    [classObj.Students, synchronousMeetings]
  )

  const excusedMeetingsByStudentMap = useMemo(
    () =>
      new Map(
        classObj.Students.map((student) => [
          student.id,
          new Set(
            synchronousMeetings.reduce((acc, curr) => {
              if (curr.ExcusedStudents.some((s) => s.id === student.id)) {
                return [...acc, curr.id]
              }
              return acc
            }, [] as string[])
          ),
        ])
      ),
    [classObj.Students, synchronousMeetings]
  )

  const absentMeetingsByStudentMap = useMemo(
    () =>
      new Map(
        classObj.Students.map((student) => [
          student.id,
          new Set(
            synchronousMeetings.reduce((acc, curr) => {
              if (curr.AbsentStudents.some((s) => s.id === student.id)) {
                return [...acc, curr.id]
              }
              return acc
            }, [] as string[])
          ),
        ])
      ),
    [classObj.Students, synchronousMeetings]
  )

  const handleChange = useCallback((studentId: string, meetingId: string) => {
    function addAbsent(studentId: string, meetingId: string) {
      setSynchronousMeetings((prev) =>
        prev.map((meeting) =>
          meeting.id === meetingId
            ? {
                ...meeting,
                AbsentStudents: [...meeting.AbsentStudents, { id: studentId }],
                AttendingStudents: meeting.AttendingStudents.filter(
                  (student) => student.id !== studentId
                ),
                ExcusedStudents: meeting.ExcusedStudents.filter(
                  (student) => student.id !== studentId
                ),
              }
            : meeting
        )
      )
    }

    function addExcused(studentId: string, meetingId: string) {
      setSynchronousMeetings((prev) =>
        prev.map((meeting) =>
          meeting.id === meetingId
            ? {
                ...meeting,
                ExcusedStudents: [
                  ...meeting.ExcusedStudents,
                  { id: studentId },
                ],
                AttendingStudents: meeting.AttendingStudents.filter(
                  (student) => student.id !== studentId
                ),
                AbsentStudents: meeting.AbsentStudents.filter(
                  (student) => student.id !== studentId
                ),
              }
            : meeting
        )
      )
    }

    function addAttended(studentId: string, meetingId: string) {
      setSynchronousMeetings((prev) =>
        prev.map((meeting) =>
          meeting.id === meetingId
            ? {
                ...meeting,
                AttendingStudents: [
                  ...meeting.AttendingStudents,
                  { id: studentId },
                ],
                ExcusedStudents: meeting.ExcusedStudents.filter(
                  (student) => student.id !== studentId
                ),
                AbsentStudents: meeting.AbsentStudents.filter(
                  (student) => student.id !== studentId
                ),
              }
            : meeting
        )
      )
    }

    return (e: React.ChangeEvent<HTMLSelectElement>) => {
      switch (e.target.value) {
        case 'attended':
          addAttended(studentId, meetingId)
          break
        case 'excused':
          addExcused(studentId, meetingId)
          break
        case 'absent':
          addAbsent(studentId, meetingId)
          break
      }
    }
  }, [])

  const handleDelete = useCallback(
    (meetingId: string) => {
      async function deleteMeeting() {
        try {
          await api.delete('/api/meeting/', { data: { id: meetingId } })
          setSynchronousMeetings((prev) =>
            prev.filter((meeting) => meeting.id !== meetingId)
          )
          hideModal()
        } catch (err) {
          console.error(err)
          displayModal({
            title: 'Error',
            body: 'There was an error deleting the meeting. Try again later',
            buttons: [
              {
                text: 'Ok',
                onClick: () => {
                  hideModal()
                },
              },
            ],
          })
        }
      }

      displayModal({
        title: 'Are you sure you want to delete this meeting?',
        body: 'It will be deleted right away. This action cannot be undone.',
        buttons: [
          {
            text: 'Cancel',
            onClick: () => {
              hideModal()
            },
          },
          {
            text: 'Delete',
            color: 'danger',
            onClick: deleteMeeting,
          },
        ],
      })
    },
    [displayModal, hideModal]
  )

  const newestMeetingRef = useRef<HTMLTableCellElement>(null)
  const [newMeetings, setNewMeetings] = useState<
    {
      date: Date
      attendedIds: string[]
      excusedIds: string[]
      absentIds: string[]
    }[]
  >([])

  const [added, setAdded] = useState(false)
  const handleAddMeeting = useCallback(() => {
    const date = new Date()
    setNewMeetings((prev) => [
      ...prev,
      {
        date,
        attendedIds: [],
        excusedIds: [],
        absentIds: [],
      },
    ])
    setAdded(true)
  }, [setNewMeetings, setAdded])
  useEffect(() => {
    if (added) {
      const cell = newestMeetingRef.current

      if (cell) cell.scrollIntoView({ behavior: 'smooth' })
      setAdded(false)
    }
  }, [added])

  const handleDeleteNewMeeting = useCallback((index: number) => {
    return () => {
      setNewMeetings((prev) => prev.filter((_, i) => i !== index))
    }
  }, [])
  const handleChangeNewMeeting = useCallback(
    (index: number, studentId: string) => {
      return (e: React.ChangeEvent<HTMLSelectElement>) => {
        switch (e.target.value) {
          case 'attended':
            setNewMeetings((prev) =>
              prev.map((meeting, i) =>
                i === index
                  ? {
                      ...meeting,
                      attendedIds: [...meeting.attendedIds, studentId],
                      excusedIds: meeting.excusedIds.filter(
                        (id) => id !== studentId
                      ),
                      absentIds: meeting.absentIds.filter(
                        (id) => id !== studentId
                      ),
                    }
                  : meeting
              )
            )
            break
          case 'excused':
            setNewMeetings((prev) =>
              prev.map((meeting, i) =>
                i === index
                  ? {
                      ...meeting,
                      excusedIds: [...meeting.excusedIds, studentId],
                      attendedIds: meeting.attendedIds.filter(
                        (id) => id !== studentId
                      ),
                      absentIds: meeting.absentIds.filter(
                        (id) => id !== studentId
                      ),
                    }
                  : meeting
              )
            )
            break
          case 'absent':
            setNewMeetings((prev) =>
              prev.map((meeting, i) =>
                i === index
                  ? {
                      ...meeting,
                      absentIds: [...meeting.absentIds, studentId],
                      excusedIds: meeting.excusedIds.filter(
                        (id) => id !== studentId
                      ),
                      attendedIds: meeting.attendedIds.filter(
                        (id) => id !== studentId
                      ),
                    }
                  : meeting
              )
            )
            break
        }
      }
    },
    []
  )
  const handleChangeNewMeetingDate = useCallback((index: number) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewMeetings((prev) =>
        prev.map((meeting, i) =>
          i === index ? { ...meeting, date: new Date(e.target.value) } : meeting
        )
      )
    }
  }, [])

  const handleSave = useCallback(async () => {
    const dates = new Set<string>()
    const datesWithMultipleMeetings = new Set<string>()
    synchronousMeetings.forEach((meeting) => {
      const date = Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(meeting.date))
      if (dates.has(date)) {
        datesWithMultipleMeetings.add(date)
      }
      dates.add(date)
    })
    newMeetings.forEach((meeting) => {
      const date = Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(meeting.date))
      if (dates.has(date)) {
        datesWithMultipleMeetings.add(date)
      }
      dates.add(date)
    })
    if (datesWithMultipleMeetings.size > 0) {
      const datesWithMultipleMeetingsArray = Array.from(
        datesWithMultipleMeetings
      )
      displayModal({
        title: 'Multiple meetings on the same day',
        body: `You have multiple meetings on the same day. This is not allowed.
            Please fix the following dates: ${datesWithMultipleMeetingsArray.join(
              ', '
            )}`,
        buttons: [
          {
            text: 'Ok',
            onClick: () => {
              hideModal()
            },
          },
        ],
      })
      return
    }
    try {
      const payload: MeetingRequest = {
        classId: classObj.id,
        meetings: [
          ...synchronousMeetings.map((meeting) => ({
            id: meeting.id,
            attendingStudentsIds: meeting.AttendingStudents.map(
              (student) => student.id
            ),
            excusedStudentsIds: meeting.ExcusedStudents.map(
              (student) => student.id
            ),
            absentStudentsIds: meeting.AbsentStudents.map(
              (student) => student.id
            ),
          })),
          ...newMeetings.map((meeting) => ({
            date: meeting.date.toISOString(),
            attendingStudentsIds: meeting.attendedIds,
            excusedStudentsIds: meeting.excusedIds,
            absentStudentsIds: meeting.absentIds,
          })),
        ],
      }

      await api.post('/api/meeting', payload)
      router.refresh()
      setNewMeetings([])
    } catch (err) {
      console.error(err)
      displayModal({
        title: 'Error',
        body: 'There was an error saving the attendance. Try again later',
        buttons: [
          {
            text: 'Ok',
            onClick: () => {
              hideModal()
            },
          },
        ],
      })
    }
  }, [
    classObj.id,
    synchronousMeetings,
    newMeetings,
    router,
    displayModal,
    hideModal,
  ])

  const [showDelete, setShowDelete] = useState(false)

  return (
    <>
      <div className={styles.buttonsContainer}>
        <Button type="button" onClick={handleSave} color="success">
          Save
        </Button>
        <Button type="button" onClick={handleAddMeeting} color="primary">
          Add Meeting
        </Button>
        <Button
          type="button"
          onClick={() => setShowDelete((prev) => !prev)}
          color="danger"
        >
          {showDelete ? 'Hide Delete' : 'Show Delete'}
        </Button>
      </div>
      <div className={styles.container}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Student</th>
              {synchronousMeetings.map((meeting) => (
                <th key={meeting.id}>
                  {Intl.DateTimeFormat('en-US', {
                    timeZone: 'UTC',
                    month: 'short',
                    day: 'numeric',
                  }).format(meeting.date)}
                </th>
              ))}
              {newMeetings.map((newMeeting, index) => {
                const formattedDate = `${newMeeting.date.getUTCFullYear()}-${(
                  newMeeting.date.getUTCMonth() + 1
                )
                  .toString()
                  .padStart(2, '0')}-${newMeeting.date
                  .getUTCDate()
                  .toString()
                  .padStart(2, '0')}`
                return (
                  <th
                    key={index}
                    ref={
                      index === newMeetings.length - 1
                        ? newestMeetingRef
                        : undefined
                    }
                  >
                    <input
                      type="date"
                      value={formattedDate}
                      onChange={handleChangeNewMeetingDate(index)}
                    />
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {!!showDelete && (
              <tr>
                <td></td>
                {synchronousMeetings.map((meeting) => (
                  <td key={meeting.id}>
                    <Button
                      type="button"
                      color="danger"
                      onClick={() => handleDelete(meeting.id)}
                    >
                      Delete
                    </Button>
                  </td>
                ))}
                {newMeetings.map((_, index) => (
                  <td key={index}>
                    <Button
                      type="button"
                      color="danger"
                      onClick={handleDeleteNewMeeting(index)}
                    >
                      Delete
                    </Button>
                  </td>
                ))}
              </tr>
            )}

            {classObj.Students.map((student) => (
              <tr key={student.id}>
                <td>{student.fullName ?? student.email}</td>
                {synchronousMeetings.map((meeting) => {
                  const value = attendedMeetingsByStudentMap
                    .get(student.id)
                    ?.has(meeting.id)
                    ? 'attended'
                    : excusedMeetingsByStudentMap
                        .get(student.id)
                        ?.has(meeting.id)
                    ? 'excused'
                    : absentMeetingsByStudentMap
                        .get(student.id)
                        ?.has(meeting.id)
                    ? 'absent'
                    : 'noData'
                  return (
                    <td key={meeting.id} className={styles[value]}>
                      <select
                        value={value}
                        onChange={handleChange(student.id, meeting.id)}
                      >
                        <option value="attended">Present</option>
                        <option value="excused">Excused</option>
                        <option value="absent">Absent</option>
                        {value === 'noData' && (
                          <option value="noData" disabled>
                            No Data
                          </option>
                        )}
                      </select>
                    </td>
                  )
                })}
                {newMeetings.map((newMeeting, index) => {
                  const value = newMeeting.attendedIds.includes(student.id)
                    ? 'attended'
                    : newMeeting.excusedIds.includes(student.id)
                    ? 'excused'
                    : newMeeting.absentIds.includes(student.id)
                    ? 'absent'
                    : 'noData'
                  return (
                    <td key={index} className={styles[value]}>
                      <select
                        value={value}
                        onChange={handleChangeNewMeeting(index, student.id)}
                      >
                        <option value="attended">Present</option>
                        <option value="excused">Excused</option>
                        <option value="absent">Absent</option>
                        <option value="noData" disabled>
                          No Data
                        </option>
                      </select>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
