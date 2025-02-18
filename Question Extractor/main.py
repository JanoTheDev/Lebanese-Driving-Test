import json
import os
from extract_ar import extract_ar_questions
from extract_en import extract_en_questions
from extract_fr import extract_fr_questions

def save_questions(questions, language):
    output_dir = "output"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    output_file = os.path.join(output_dir, f"dssl_questions_{language}.json")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump({"questions": questions}, f, ensure_ascii=False, indent=4)
    print(f"\nExtracted {len(questions)} questions for {language}")
    print(f"JSON file saved as {output_file}")
    
    print(f"\nSample of extracted questions ({language}):")
    for q in questions[:5]:
        print(f"\nQuestion {q['id']}:")
        print(f"Category: {q['category']}")
        print(f"Question: {q['question']}")
        print("Answers:", q['answers'])
        print("Correct:", q['correctAnswer'])

def main():
    # Create input directory path
    input_dir = "input"
    
    print("Processing Arabic version...")
    ar_pdf_path = os.path.join(input_dir, "DSSL_Study_Manuals_v0.9_ar.xlsx")
    ar_questions = extract_ar_questions(ar_pdf_path)
    save_questions(ar_questions, 'ar')
    
    print("\nProcessing English version...")
    en_pdf_path = os.path.join(input_dir, "DSSL_Study_Manuals_v0.9_EN.xlsx")
    en_questions = extract_en_questions(en_pdf_path)
    save_questions(en_questions, 'en')
    
    print("\nProcessing French version...")
    fr_pdf_path = os.path.join(input_dir, "DSSL_Study_Manuals_v0.9_FR.xlsx")
    fr_questions = extract_fr_questions(fr_pdf_path)
    save_questions(fr_questions, 'fr')

if __name__ == "__main__":
    main() 