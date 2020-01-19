#Fields
# Name
# DOB
# Address
# Work

# Transactions
# Name
# Location
# Timestamp
# Amount

from datetime import datetime
from random import *



MONTHS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
]

alpha = list('ABCDEFGHIJKMNOPQRSTUVWZYZ')
out = {}
ending = ['Ave', 'Cr', 'Blvd']

with open('newwords.txt') as file:
    words = file.read().strip().split('\n')

with open('names.txt') as file:
    names = file.read().strip().split('\n')

with open('cities.txt') as file:
    city = file.read().strip().split('\n')

with open('states.txt') as file:
    state = file.read().strip().split('\n')

with open('companies.txt') as file:
    companies = file.read().strip().split('\n')


with open('categories.txt') as file:
    categories = []
    data = file.read().strip().split('\n')

    for d in data:
        if d:
            categories.append(d)

def date_to_str(date):
    return {
        'date': date.month,
        'month': MONTHS[date.month - 1],
        'year': date.year
    }

def generate_user(FIRST_NAME, LAST_NAME, AUTHREC, last4):
    DOB = date_to_str(datetime.fromtimestamp(randint(0, 10000000000)))
    #FIRST_NAME = choice(names).capitalize()
    #LAST_NAME = choice(names).capitalize()
    NAME = (FIRST_NAME + ' ' + LAST_NAME).lower()
    POSTALCODE = '%s%i%s %i%s%i' % (choice(alpha), randint(0, 9), choice(alpha), randint(0, 9),  choice(alpha), randint(0, 9))

    ADDRESS = '%i %s %s\n%s, %s\nCANADA %s' % (randint(1, 1000), choice(names).capitalize(), choice(ending), choice(city), choice(state), POSTALCODE)

    transactions = []

    for _ in range(randint(10, 20)):
        transactions.append(generate_transaction())

    return {
        'dob': DOB,
        'first_name': FIRST_NAME,
        'last_name': LAST_NAME,
        'name': NAME,
        'address': ADDRESS,
        'transactions': [], #transactions,
        'accounts' : {
            'Savings' : round(randint(0, 100000) / 100, 2),
            'Chequing' : round(randint(0, 100000) / 100, 2),
            'Visa' : round(randint(0, 100000) / 100, 2),
        },
        'card' : {
            'Visa': {
                'number' : str(randint(100000000000, 1000000000000)) + last4,
                'expiry_date' : date_to_str(datetime.fromtimestamp(randint(0, 10000000000)))
            }
        },
        'authorized_recipients' : AUTHREC,
        'pending_transactions' : [
            {
                'name': 'Utilities',
                'amount': randint(10000, 20000) / 100,
                'due': randint(1, 10)
            }, {
                'name': 'Cell Phone',
                'amount': randint(4000, 10000) / 100,
                'due': randint(1, 10)
            }, {
                'name': 'Rent',
                'amount': randint(100000, 300000) / 100,
                'due': randint(1, 10)
            }
        ],
        'message_queue' : []
    }

def generate_transaction():
    COMPANY_NAME = choice(companies)
    LOCATION = '%s, %s' % (choice(city), choice(state))
    TIME_STAMP = date_to_str(datetime.fromtimestamp(randint(0, 10000000000)))
    AMOUNT = '$%0.2f' % (round(randint(0, 10000) / 100, 2))
    CATEGORY = choice(categories)

    return {
        'name': COMPANY_NAME,
        'location': LOCATION,
        'timestamp': TIME_STAMP,
        'amount': AMOUNT,
        'category': CATEGORY
    }

users = {}

users['correct horse battery staple'] = generate_user('Henry', 'Tu', ['car insect mean common'], '1234')
users['car insect mean common'] = generate_user('Misha', 'Larionov', ['correct horse battery staple', 'i want your ass'], '4321')
users['i want your ass'] = generate_user('Karl', 'Zhu', [], '6969')

#for _ in range(20):
#    users['%s %s %s %s' % (choice(words), choice(words), choice(words), choice(words))] = generate_user()

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from firebase_admin import auth
from datetime import datetime
import time

cred = credentials.Certificate('fbsecret.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

for u in users:
    db.collection('users').document(u).set(users[u])