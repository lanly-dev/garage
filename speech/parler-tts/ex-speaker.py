import torch
from parler_tts import ParlerTTSForConditionalGeneration
from transformers import AutoTokenizer
import soundfile as sf
import sounddevice as sd
from datetime import datetime

def print_with_timestamp(message):
    print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - {message}")

device = "cuda:0" if torch.cuda.is_available() else "cpu"

print_with_timestamp('Using device: ' + device)
model = ParlerTTSForConditionalGeneration.from_pretrained("parler-tts/parler-tts-mini-v1").to(device)
tokenizer = AutoTokenizer.from_pretrained("parler-tts/parler-tts-mini-v1")

print_with_timestamp('Model loaded')
prompt = "Hey, how are you doing today? I'm fine, how about you?"
description = "A female speaker delivers a slightly expressive and animated speech with a moderate speed and pitch. The recording is of very high quality, with the speaker's voice sounding clear and very close up."

input_ids = tokenizer(description, return_tensors="pt").input_ids.to(device)
prompt_input_ids = tokenizer(prompt, return_tensors="pt").input_ids.to(device)

print_with_timestamp('Generating audio...')
generation = model.generate(input_ids=input_ids, prompt_input_ids=prompt_input_ids)
audio_arr = generation.cpu().numpy().squeeze()

print_with_timestamp('Audio generated')
# Play the audio using sounddevice
sd.play(audio_arr, samplerate=model.config.sampling_rate)
sd.wait()
