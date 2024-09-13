import csv
import random

def generate_ticket_data(num_records=10):
    tickets = []
    departments = ['Technical Support', 'Software Development', 'Networking', 'Hardware', 'Security']
    status_options = ['open', 'closed']
    descriptions = ["Phone broken", "Can't connect to the internet", "Need help with software installation", "Need help with password reset", 
                   "Need help with email setup", "Need help with printer setup", "Need help with network setup", "Need help with security setup"]

    for i in range(1, num_records + 1):
        title = f"Ticket {i}"
        department = random.choice(departments)
        status = random.choice(status_options)
        description = random.choice(descriptions)
        ticket = [i, title, description, department, status]
        tickets.append(ticket)
    
    return tickets

headers = ["ID", "Title", "Description", "Department", "Status"]
ticket_data = generate_ticket_data(20)

csv_file_path = "../sql/ticket.csv"
with open(csv_file_path, mode='w', newline='') as file:
    writer = csv.writer(file, quoting=csv.QUOTE_MINIMAL)
    writer.writerow(headers)
    writer.writerows(ticket_data)

print(f"CSV file created at {csv_file_path}")
