import { exec } from 'child_process'
const cmd = `ffmpeg -i out/sample/accompaniment.wav -i out/sample/vocals.wav -filter_complex amix=inputs=2:duration=longest out/sample/merged.mp3`
exec(cmd, (err, stdout, stderr) => {
  if (err) console.error(err)
  // console.log(stdout)
  // console.log(stderr)
})
