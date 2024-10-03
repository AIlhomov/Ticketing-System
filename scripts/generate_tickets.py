import csv
import random

def generate_ticket_data(num_records=10):
    tickets = []
    categories = ['Hardware', 'Software', 'Network', 'Security']
    status_options = ['open', 'closed']
    descriptions = ["Phone broken", "Can't connect to the internet", "Need help with software installation", "Need help with password reset", 
                   "Need help with email setup", "Need help with printer setup", "Need help with network setup", "Need help with security setup"]

    for i in range(1, num_records + 1):
        title = f"Ticket {i}"
        category = random.choice(categories)
        status = random.choice(status_options)
        description = random.choice(descriptions)
        ticket = [i, title, description, category, status]
        tickets.append(ticket)
    
    return tickets

headers = ["id", "title", "description", "category", "status"]
ticket_data = generate_ticket_data(5)

csv_file_path = "../sql/ticket.csv"

if __name__ == "__main__":
    with open(csv_file_path, mode='w', newline='') as file:
        writer = csv.writer(file, quoting=csv.QUOTE_ALL)
        writer.writerow(headers)
        writer.writerows(ticket_data)

    print(f"CSV file created at {csv_file_path}")
