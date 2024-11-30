from PIL import Image
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

    token_positions = []

    for i, token in enumerate(tokens):
        x = i % width
        y = i // width
        pixels[x, y] = color_map[token]
        token_positions.append((token, x, y))

    return image, token_positions

# Function to revert the image back to text
def revert_image_to_text(image, color_map):
    pixels = image.load()
    width, height = image.size
    reverse_map = {v: k for k, v in color_map.items()}
    tokens = []

    for y in range(height):
        for x in range(width):
            color = pixels[x, y]
            if color in reverse_map:
                tokens.append(reverse_map[color])

    return ' '.join(tokens)

# File path to the text file
filename = 'browser.ts'  # Replace with your text file path

# Process the text file
tokens = tokenize_text(filename)
color_map = generate_color_map(tokens)
image, token_positions = create_image_from_tokens(tokens, color_map)

# Save the image
image.save('output.png')

# Display the image (optional)
image.show()

# Revert the image back to text
reverted_text = revert_image_to_text(image, color_map)
print('Reverted Text:')
print(reverted_text)
