import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

export default async function convertWebmToMp3(webmBlob: Blob): Promise<Blob> {
  const ffmpeg = new FFmpeg()
  await ffmpeg.load()

  const inputName = 'input.webm'
  const outputName = 'output.mp3'

  ffmpeg.writeFile(inputName, await fetchFile(webmBlob))

  await ffmpeg.exec(['-i', inputName, outputName])

  const outputData = await ffmpeg.readFile(outputName)
  const outputBlob = new Blob([outputData], { type: 'audio/mp3' })

  return outputBlob
}
