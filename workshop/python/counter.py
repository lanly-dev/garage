from collections import Counter

# Function to count characters in a text file
def count_characters(filename):
    with open(filename, 'r') as file:
        text = file.read()

    # Count the frequency of each character
    char_count = Counter(text)

    # Sort characters by frequency in descending order
    ranked_characters = char_count.most_common()

    return ranked_characters

# Function to display the character frequencies
def display_characters(ranked_characters):
    print(f"{'Character':^12}{'Frequency':^12}")
    print('-' * 24)
    for char, freq in ranked_characters:
        print(f"{repr(char):^12}{freq:^12}")

# File path to the text file
filename = 'browser.ts'  # Replace with your text file path

# Get the ranked characters
ranked_characters = count_characters(filename)

# Display the ranked characters
display_characters(ranked_characters)
