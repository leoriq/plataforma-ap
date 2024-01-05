'use client'

import { useAudioRecorder } from 'react-audio-voice-recorder'
import MicrophoneIcon from '../icons/MicrophoneIcon'

import styles from './AudioRecorder.module.scss'
import StopIcon from '../icons/StopIcon'
import classNames from 'classnames'
import { useEffect, useMemo } from 'react'

interface Props {
  disabled?: boolean
  onRecordingComplete: (blob: Blob) => void
}

export default function AudioRecorder({
  disabled,
  onRecordingComplete,
}: Props) {
  const { startRecording, stopRecording, recordingBlob, isRecording } =
    useAudioRecorder()

  useEffect(() => {
    if (recordingBlob) {
      onRecordingComplete(recordingBlob)
    }
  }, [recordingBlob, onRecordingComplete])

  function handleButton() {
    if (disabled) return
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const url = useMemo(() => {
    if (!recordingBlob) return undefined
    return URL.createObjectURL(recordingBlob)
  }, [recordingBlob])

  return (
    <div className={styles.container}>
      <button
        disabled={disabled}
        onClick={handleButton}
        type="button"
        className={classNames(
          styles.micButton,
          isRecording && styles.stopButton
        )}
      >
        {!isRecording && <MicrophoneIcon />}
        {isRecording && <StopIcon />}
      </button>
      {!!url && <audio src={url} controls />}
    </div>
  )
}
