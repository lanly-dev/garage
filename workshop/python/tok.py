from PIL import Image
from collections import defaultdict
import random

# Function to read and tokenize the text file
def tokenize_text(filename):
    with open(filename, 'r') as file:
        text = file.read()
    # Tokenize by splitting on spaces
    tokens = text.split()
    return tokens

# Function to generate a color map for each unique token
def generate_color_map(tokens):
    unique_tokens = set(tokens)
    color_map = {token: (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255)) for token in unique_tokens}
    return color_map

# Function to create an image from the tokenized text
def create_image_from_tokens(tokens, color_map, width=100):
    height = (len(tokens) // width) + 1
    image = Image.new('RGB', (width, height), 'white')
    pixels = image.load()

    for i, token in enumerate(tokens):
        x = i % width
        y = i // width
        pixels[x, y] = color_map[token]

    return image

# File path to the text file
filename = 'browser.ts'  # Replace with your text file path

# Process the text file
tokens = tokenize_text(filename)
color_map = generate_color_map(tokens)
image = create_image_from_tokens(tokens, color_map)

# Save the image
image.save('output.png')

# Display the image (optional)
image.show()
