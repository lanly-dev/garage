# W2L Inference Environment Setup

## 1. Create and Activate Virtual Environment

```
powershell -Command "python -m venv .venv"
powershell -Command ".venv\Scripts\Activate.ps1"
```

## 2. Install Requirements

```
pip install -r requirements.txt
```

## 3. Run Inference

```
python inference.py --checkpoint_path <path_to_checkpoint> --face <path_to_face> --audio <path_to_audio> --outfile <output_path>
```

---

### Notes
- If you have custom modules (audio, face_detection, models), ensure they are available in your Python path or install them as needed.
- Python 3.11+ is recommended.

# Wav2Lip-Inspired Inference


This project is inspired by the inference pipeline from the official Wav2Lip repository: https://github.com/Rudrabha/Wav2Lip/blob/master/inference.py
It is not a direct fork, but uses similar concepts and code structure for lip-sync video generation.

## Setup Instructions

### 1. Create and Activate Virtual Environment
```
powershell -Command "python -m venv .venv"
powershell -Command ".venv\Scripts\Activate.ps1"
```

### 2. Install Requirements
```
pip install -r requirements.txt
```

### 3. Download Pretrained Model
- Download the Wav2Lip pretrained model from the official repo: https://github.com/Rudrabha/Wav2Lip#pretrained-model
- Place the checkpoint file in your project directory.

### 4. Prepare Inputs
- You need a video/image file with faces (`--face`)
- You need an audio file (`--audio`)

# Minimal Setup

1. Create env & install requirements:
	powershell -Command "python -m venv .venv"
	powershell -Command ".venv\Scripts\Activate.ps1"
	pip install --upgrade pip
	pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
	pip install -r requirements.txt

2. Run:
	python inference.py --checkpoint_path <model> --face <face> --audio <audio> --outfile <output>


Note: On Windows, you may need GCC for building some dependencies. Download GCC from https://winlibs.com/ and add it to your PATH. --> Not sure if needed but installation complain relates about it, and include the bin doesn't help

It need ffmpeg to run https://github.com/BtbN/FFmpeg-Builds https://github.com/BtbN/FFmpeg-Builds/releases/tag/latest
