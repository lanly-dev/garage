## Setup env
```
python3.8 -m venv --system-site-packages .\.venv
```

https://github.com/deezer/spleeter/wiki/2.-Getting-started
```sh
pip install spleeter
```
```sh
spleeter separate -o out audio_example.mp3
spleeter separate -o out -p spleeter:4stems audio_example.mp3
spleeter separate -o out -p spleeter:5stems audio_example.mp3
spleeter separate -o out -p spleeter:4stems-16kHz audio_example.mp3
```
```sh
spleeter separate -o out <path/to/audio1.mp3> <path/to/audio2.wav> <path/to/audio3.ogg>
```

Failed to install on python3.11, need older python?
