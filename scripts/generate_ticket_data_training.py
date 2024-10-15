import csv
import random
import datetime
import numpy as np
import pandas as pd

def generate_random_date():
    """Generate a random date within the last 2 years."""
    start_date = datetime.datetime.now() - datetime.timedelta(days=730)
    random_days = random.randint(0, 730)
    random_date = start_date + datetime.timedelta(days=random_days)
    return random_date.strftime('%Y-%m-%d %H:%M:%S')

# Define common phrases to introduce vocabulary overlap
common_phrases = {
    'issue_types': ["Issue", "Problem", "Question", "Request", "Assistance", "Support", "Help", "Inquiry"],
    'problems': ["not working", "error", "issue", "problem", "question", "need help", "assistance needed", "urgent"],
    'actions_required': ["please help", "need assistance", "require support", "looking for help", "requesting assistance", "please assist"]
}

# Define category-specific phrases with overlapping vocabulary
category_phrases = {
    'General Inquiry': {
        'issue_types': ["Product", "Service", "Information", "Guidance", "Advice"] + common_phrases['issue_types'],
        'problems': ["inquiry", "question", "clarification needed", "looking for information", "seeking details"] + common_phrases['problems'],
        'actions_required': ["please provide details", "need more information", "want to know", "could you help"] + common_phrases['actions_required']
    },
    'Technical Support': {
        'issue_types': ["Computer", "Software", "Application", "System", "Network", "Laptop", "Printer", "Device"] + common_phrases['issue_types'],
        'problems': ["crashing", "slow", "error message", "unresponsive", "glitches", "bugs"] + common_phrases['problems'],
        'actions_required': ["needs fixing", "requires troubleshooting", "needs an update", "please help"] + common_phrases['actions_required']
    },
    'Billing': {
        'issue_types': ["Invoice", "Payment", "Billing statement", "Charge", "Subscription", "Fee", "Bill", "Cost"] + common_phrases['issue_types'],
        'problems': ["incorrect", "overcharged", "discrepancy", "not received", "double charged", "unexpected charge"] + common_phrases['problems'],
        'actions_required': ["needs correction", "please review", "requires adjustment", "needs clarification", "needs refund"] + common_phrases['actions_required']
    },
    'Feedback': {
        'issue_types': ["Service", "Product", "Experience", "Support", "Website", "App", "Customer service"] + common_phrases['issue_types'],
        'problems': ["feedback", "suggestion", "comment", "opinion", "experience", "review"] + common_phrases['problems'],
        'actions_required': ["sharing thoughts", "wanted to let you know", "hope this helps", "improvement suggestion"] + common_phrases['actions_required']
    },
    'Security': {
        'issue_types': ["Account", "Password", "Login", "Security", "Data", "Privacy"] + common_phrases['issue_types'],
        'problems': ["compromised", "hacked", "breach", "unauthorized access", "suspicious activity"] + common_phrases['problems'],
        'actions_required': ["needs immediate attention", "please secure", "requires password reset", "urgent assistance needed"] + common_phrases['actions_required']
    },
    'Account Management': {
        'issue_types': ["Account", "Profile", "Settings", "Preferences", "User information", "Registration"] + common_phrases['issue_types'],
        'problems': ["update", "change request", "modification", "cannot access", "locked out", "forgot password"] + common_phrases['problems'],
        'actions_required': ["needs updating", "requires assistance", "needs reset", "requires update"] + common_phrases['actions_required']
    },
    'Sales Support': {
        'issue_types': ["Purchase", "Order", "Product inquiry", "Availability", "Pricing", "Quote", "Deal", "Discount"] + common_phrases['issue_types'],
        'problems': ["need information", "looking for", "interest in buying", "quotation", "price request"] + common_phrases['problems'],
        'actions_required': ["please provide details", "needs assistance", "requires information", "send quote"] + common_phrases['actions_required']
    },
    'Warranty Inquiry': {
        'issue_types': ["Warranty", "Guarantee", "Coverage", "Repair policy", "Service plan"] + common_phrases['issue_types'],
        'problems': ["expiry", "terms", "conditions", "eligible", "claim", "status"] + common_phrases['problems'],
        'actions_required': ["need to know", "please inform", "require details", "clarification needed"] + common_phrases['actions_required']
    },
    'Refund Request': {
        'issue_types': ["Refund", "Return", "Reimbursement", "Money back", "Cancellation"] + common_phrases['issue_types'],
        'problems': ["requesting", "want to", "need to", "not satisfied", "defective product", "changed mind"] + common_phrases['problems'],
        'actions_required': ["process refund", "please assist", "needs processing", "issue refund"] + common_phrases['actions_required']
    },
    'Device Replacement': {
        'issue_types': ["Device", "Equipment", "Hardware", "Accessory", "Component", "Gadget"] + common_phrases['issue_types'],
        'problems': ["broken", "malfunctioning", "defective", "damaged", "faulty", "stopped working"] + common_phrases['problems'],
        'actions_required': ["needs replacement", "requires exchange", "please replace", "needs new unit"] + common_phrases['actions_required']
    }
}

def introduce_typos(text):
    """Introduce typos into the text to mimic real-world errors."""
    words = text.split()
    num_typos = max(1, int(len(words) * 0.1))  # Introduce typos in 10% of words
    for _ in range(num_typos):
        idx = random.randint(0, len(words) - 1)
        word = words[idx]
        if len(word) > 3:
            char_idx = random.randint(0, len(word) - 1)
            word = word[:char_idx] + random.choice('abcdefghijklmnopqrstuvwxyz') + word[char_idx + 1:]
            words[idx] = word
    return ' '.join(words)

def generate_random_description(category):
    """Generate more diverse and less predictable descriptions."""
    phrases = category_phrases[category]
    num_sentences = random.randint(1, 3)
    description_sentences = []
    for _ in range(num_sentences):
        sentence_structure = random.choice([
            "{issue_type} {problem}, {action_required}.",
            "{action_required} because {issue_type} {problem}.",
            "Due to {issue_type} being {problem}, {action_required}.",
            "{issue_type} is {problem} and {action_required}.",
            "Facing {problem} with {issue_type}, {action_required}.",
            "I have an {issue_type} that is {problem}, {action_required}.",
            "{action_required} as {issue_type} has {problem}.",
            "Because {issue_type} is {problem}, I {action_required}.",
            "{issue_type} {problem}, need help.",
            "{issue_type} {problem}, please advise."
        ])
        sentence = sentence_structure.format(
            issue_type=random.choice(phrases['issue_types']),
            problem=random.choice(phrases['problems']),
            action_required=random.choice(phrases['actions_required'])
        )
        sentence = introduce_typos(sentence)
        description_sentences.append(sentence)
        
        # Introduce irrelevant or misleading information
        if random.random() < 0.3:  # 30% chance to add irrelevant sentence
            irrelevant_phrases = [
                "The weather is nice today.",
                "Looking forward to the weekend.",
                "My favorite color is blue.",
                "Just got a new puppy.",
                "I love playing guitar.",
                "Had coffee this morning.",
                "Went for a run today.",
                "Enjoying the sunny day.",
                "Reading a good book.",
                "Watching a movie tonight."
            ]
            irrelevant_sentence = random.choice(irrelevant_phrases)
            description_sentences.append(irrelevant_sentence)
    
    random.shuffle(description_sentences)
    description = " ".join(description_sentences)
    return description.strip()

def generate_ticket_data(num_records=5000):
    tickets = []
    categories = list(category_phrases.keys())
    status_options = ['open', 'closed']
    
    for i in range(1, num_records + 1):
        category = random.choice(categories)
        
        # Generate a more diverse title with overlapping vocabulary
        title_phrases = category_phrases[category]
        title_issue_type = random.choice(title_phrases['issue_types'])
        title_problem = random.choice(title_phrases['problems'])
        title_structure = random.choice([
            "Issue: {issue_type} {problem}",
            "{issue_type} {problem}",
            "Need help with {issue_type}",
            "Problem: {issue_type} {problem}",
            "Assistance needed for {issue_type}",
            "{issue_type} - {problem}",
            "Question about {issue_type}",
            "Support request: {issue_type} {problem}",
            "Urgent: {issue_type} {problem}",
            "Help needed: {issue_type}"
        ])
        title = title_structure.format(
            issue_type=title_issue_type,
            problem=title_problem
        )
        title = introduce_typos(title)
    
        status = random.choice(status_options)
        description = generate_random_description(category)
        ticket_date = generate_random_date()
        
        ticket = [i, title, description, category, status, ticket_date]
        tickets.append(ticket)
    
    return tickets

if __name__ == "__main__":
    headers = ["id", "title", "description", "category", "status", "created_at"]
    ticket_data = generate_ticket_data(5000)
    # Remove duplicates
    df_tickets = pd.DataFrame(ticket_data, columns=headers)
    df_tickets.drop_duplicates(subset=['title', 'description'], inplace=True)
    df_tickets.to_csv("../sql/ticketTrainingGround.csv", index=False)
    df = pd.read_csv('../sql/ticketTrainingGround.csv')
    print(f"Total records after removing duplicates: {df.shape[0]}")
    print(f"CSV file created at ../sql/ticketTrainingGround.csv")
