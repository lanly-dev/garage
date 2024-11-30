from PIL import Image

# Read the text file
with open('browser.ts', 'r') as file:
    text = file.read()

# Define the dimensions of the image
width = 120  # Width of the image
height = (len(text) // width) + 1  # Calculate height based on the length of the text

# Create a new image with white background
image = Image.new('RGB', (width, height), 'white')
pixels = image.load()

# Convert each character to a pixel
for i, char in enumerate(text):
    x = i % width
    y = i // width
    pixels[x, y] = (0, 0, 0) if char != ' ' else (255, 255, 255)  # Black for characters, white for spaces

# Save the image
image.save('output.png')
