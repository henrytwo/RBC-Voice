import pyphen
dic = pyphen.Pyphen(lang='en')

out = []

MIN_LENGTH = 5
MAX_LENGTH = 15

with open('words.txt') as file:
    words = file.read().strip().split('\n')

    for w in words:
        if MIN_LENGTH < len(w) < MAX_LENGTH and dic.inserted(w).count('-') <= 2 and w.isalpha():
            out.append(w)

with open('newwords.txt', 'w') as file:
    for w in out:
        file.write(w + '\n')