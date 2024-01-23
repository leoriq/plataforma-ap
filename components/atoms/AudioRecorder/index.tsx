'use client'

import { useAudioRecorder } from 'react-audio-voice-recorder'
import MicrophoneIcon from '../icons/MicrophoneIcon'

import styles from './AudioRecorder.module.scss'
import StopIcon from '../icons/StopIcon'
import classNames from 'classnames'
import { useCallback, useEffect } from 'react'

interface Props {
  disabled?: boolean
  onRecordingComplete: (blob: Blob) => void
  recordingUrl?: string
}

export default function AudioRecorder({
  disabled,
  onRecordingComplete,
  recordingUrl,
}: Props) {
  const { startRecording, stopRecording, isRecording, mediaRecorder } =
    useAudioRecorder()

  useEffect(() => {
    if (mediaRecorder)
      mediaRecorder.ondataavailable = (e) => {
        onRecordingComplete(e.data)
      }
  }, [mediaRecorder, onRecordingComplete])

  const handleButton = useCallback(() => {
    if (disabled) return
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [disabled, isRecording, startRecording, stopRecording])

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
      {!!recordingUrl && <audio src={recordingUrl} controls />}
    </div>
  )
}
