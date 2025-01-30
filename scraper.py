import requests
from bs4 import BeautifulSoup
from supabase import create_client
import os
from dotenv import load_dotenv
from datetime import datetime
import re

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = 'https://gufzwtbllwjbqwojakee.supabase.co'
supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1Znp3dGJsbHdqYnF3b2pha2VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxMTM3NjAsImV4cCI6MjA1MzY4OTc2MH0.n5c5zsVjObPjB3w4ewJDl8cWKr6JaN8TSqYdO6Of2tw'
supabase = create_client(supabase_url, supabase_key)


def clean_course_code(course_code):
    """Remove any non-alphabetic prefixes from course codes."""
    # Find the first letter in the course code
    match = re.search(r'[A-Za-z]', course_code)
    if match:
        # Return everything from the first letter onwards
        return course_code[match.start():].strip()
    return course_code.strip()

def scrape_and_store_courses(urls):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36"
    }
    
    try:
        for url in urls:
            print(f"\nScraping courses from: {url}")
            print("=" * 50)
            
            page = requests.get(url, headers=headers)
            page.raise_for_status()
            soup = BeautifulSoup(page.text, 'html.parser')
            
            course_elements = soup.find_all('p', {'class': 'calccode'})
            
            for course_element in course_elements:
                course = course_element.find('a')
                if course:
                    # Clean the course code before using it
                    course_code = clean_course_code(course.text.strip())
                    course_name = course_element.find_next('p', {'class': 'calcname'})
                    descriptions = course_name.find_all_next('p', {'class': 'calnormal'}, limit=2)
                    
                    course_description = None
                    if descriptions:
                        if "also offered as" in descriptions[0].text.lower() and len(descriptions) > 1:
                            course_description = descriptions[1].text.strip()
                        else:
                            course_description = descriptions[0].text.strip()
                    
                    # Extract prerequisite information (from first script)
                    prerequisite_info = "N/A"
                    for p_tag in course_element.find_all_next('p', {'class': 'calnormal'}):
                        if "Prerequisite(s):" in p_tag.text:
                            prerequisite_info = p_tag.text.strip().replace("Prerequisite(s):", "").strip()
                            break  # Stop after finding the prerequisite info
                        elif "Note:" in p_tag.text:
                            # Stop searching if we reach the "Note:" tag
                            break
                    
                    # Prepare course data with prerequisite
                    course_data = {
                        'course_code': course_code,
                        'course_name': course_name.text.strip() if course_name else None,
                        'course_desc': course_description,
                        'course_prereq': prerequisite_info,
                        'created_at': datetime.utcnow().isoformat()
                    }
                    
                    try:
                        # Check if course already exists
                        existing_course = supabase.table('Courses')\
                            .select('course_code')\
                            .eq('course_code', course_code)\
                            .execute()
                        
                        if not existing_course.data:
                            # Insert data into Supabase if course doesn't exist
                            response = supabase.table('Courses').insert(course_data).execute()
                            print(f"Successfully stored course: {course_code}")
                        else:
                            print(f"Skipping duplicate course: {course_code}")
                    except Exception as e:
                        if 'duplicate key value violates unique constraint' in str(e):
                            print(f"Skipping duplicate course: {course_code}")
                        else:
                            print(f"Error storing course {course_code}: {e}")
                    
                    # Optional: Print prerequisite info to console
                    print(f"\nCourse: {course_code}")
                    if course_name:
                        print(f"Title: {course_name.text.strip()}")
                    if course_description:
                        print(f"Description: {course_description}")
                    print(f"Prerequisite: {prerequisite_info}")  # New print line
                    print("-" * 50)
                    
    except requests.RequestException as e:
        print(f"Error fetching the webpage: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    # List of URLs to scrape
    urls_to_scrape = [
        "https://brocku.ca/webcal/2024/undergrad/cosc.html",
        "https://brocku.ca/webcal/2024/undergrad/math.html",
        "https://brocku.ca/webcal/2024/undergrad/abed.html",
        "https://brocku.ca/webcal/2024/undergrad/abte.html",
        "https://brocku.ca/webcal/2024/undergrad/accc.html",
        "https://brocku.ca/webcal/2024/undergrad/actg.html",
        "https://brocku.ca/webcal/2024/undergrad/aded.html",
        "https://brocku.ca/webcal/2024/undergrad/admi.html",
        "https://brocku.ca/webcal/2024/undergrad/adst.html",
        "https://brocku.ca/webcal/2024/undergrad/apco.html",
        "https://brocku.ca/webcal/2024/undergrad/astr.html",
        "https://brocku.ca/webcal/2024/undergrad/bchm.html",
        "https://brocku.ca/webcal/2024/undergrad/biol.html",
        "https://brocku.ca/webcal/2024/undergrad/bmed.html",
        "https://brocku.ca/webcal/2024/undergrad/bost.html",
        "https://brocku.ca/webcal/2024/undergrad/bphy.html",
        "https://brocku.ca/webcal/2024/undergrad/brdg.html",
        "https://brocku.ca/webcal/2024/undergrad/btec.html",
        "https://brocku.ca/webcal/2024/undergrad/btgd.html",
        "https://brocku.ca/webcal/2024/undergrad/cana.html",
        "https://brocku.ca/webcal/2024/undergrad/chem.html",
        "https://brocku.ca/webcal/2024/undergrad/chys.html",
        "https://brocku.ca/webcal/2024/undergrad/clas.html",
        "https://brocku.ca/webcal/2024/undergrad/comm.html",
        "https://brocku.ca/webcal/2024/undergrad/cpcf.html",
        "https://brocku.ca/webcal/2024/undergrad/crim.html",
        "https://brocku.ca/webcal/2024/undergrad/dart.html",
        "https://brocku.ca/webcal/2024/undergrad/dasa.html",
        "https://brocku.ca/webcal/2024/undergrad/ecec.html",
        "https://brocku.ca/webcal/2024/undergrad/econ.html",
        "https://brocku.ca/webcal/2024/undergrad/edbe.html",
        "https://brocku.ca/webcal/2024/undergrad/educ.html",
        "https://brocku.ca/webcal/2024/undergrad/encw.html",
        "https://brocku.ca/webcal/2024/undergrad/engl.html",
        "https://brocku.ca/webcal/2024/undergrad/engr.html",
        "https://brocku.ca/webcal/2024/undergrad/engs.html",
        "https://brocku.ca/webcal/2024/undergrad/ensu.html",
        "https://brocku.ca/webcal/2024/undergrad/entr.html",
        "https://brocku.ca/webcal/2024/undergrad/ersc.html",
        "https://brocku.ca/webcal/2024/undergrad/ethc.html",
        "https://brocku.ca/webcal/2024/undergrad/film.html",
        "https://brocku.ca/webcal/2024/undergrad/flic.html",
        "https://brocku.ca/webcal/2024/undergrad/fmsc.html",
        "https://brocku.ca/webcal/2024/undergrad/fnce.html",
        "https://brocku.ca/webcal/2024/undergrad/fpac.html",
        "https://brocku.ca/webcal/2024/undergrad/fren.html",
        "https://brocku.ca/webcal/2024/undergrad/geog.html",
        "https://brocku.ca/webcal/2024/undergrad/germ.html",
        "https://brocku.ca/webcal/2024/undergrad/gree.html",
        "https://brocku.ca/webcal/2024/undergrad/hist.html",
        "https://brocku.ca/webcal/2024/undergrad/hlsc.html",
        "https://brocku.ca/webcal/2024/undergrad/huma.html",
        "https://brocku.ca/webcal/2024/undergrad/humc.html",
        "https://brocku.ca/webcal/2024/undergrad/iasc.html",
        "https://brocku.ca/webcal/2024/undergrad/indg.html",
        "https://brocku.ca/webcal/2024/undergrad/ital.html",
        "https://brocku.ca/webcal/2024/undergrad/itis.html",
        "https://brocku.ca/webcal/2024/undergrad/kine.html",
        "https://brocku.ca/webcal/2024/undergrad/labr.html",
        "https://brocku.ca/webcal/2024/undergrad/lati.html",
        "https://brocku.ca/webcal/2024/undergrad/lawp.html",
        "https://brocku.ca/webcal/2024/undergrad/lcbe.html",
        "https://brocku.ca/webcal/2024/undergrad/ling.html",
        "https://brocku.ca/webcal/2024/undergrad/mars.html",
        "https://brocku.ca/webcal/2024/undergrad/medp.html",
        "https://brocku.ca/webcal/2024/undergrad/mgmt.html",
        "https://brocku.ca/webcal/2024/undergrad/mktg.html",
        "https://brocku.ca/webcal/2024/undergrad/mllc.html",
        "https://brocku.ca/webcal/2024/undergrad/musi.html",
        "https://brocku.ca/webcal/2024/undergrad/neur.html",
        "https://brocku.ca/webcal/2024/undergrad/nurs.html",
        "https://brocku.ca/webcal/2024/undergrad/nusc.html",
        "https://brocku.ca/webcal/2024/undergrad/obhr.html",
        "https://brocku.ca/webcal/2024/undergrad/oevi.html",
        "https://brocku.ca/webcal/2024/undergrad/oper.html",
        "https://brocku.ca/webcal/2024/undergrad/pcul.html",
        "https://brocku.ca/webcal/2024/undergrad/phil.html",
        "https://brocku.ca/webcal/2024/undergrad/phys.html",
        "https://brocku.ca/webcal/2024/undergrad/pmpb.html",
        "https://brocku.ca/webcal/2024/undergrad/poli.html",
        "https://brocku.ca/webcal/2024/undergrad/psyc.html",
        "https://brocku.ca/webcal/2024/undergrad/recl.html",
        "https://brocku.ca/webcal/2024/undergrad/scie.html",
        "https://brocku.ca/webcal/2024/undergrad/scis.html",
        "https://brocku.ca/webcal/2024/undergrad/soci.html",
        "https://brocku.ca/webcal/2024/undergrad/sosc.html",
        "https://brocku.ca/webcal/2024/undergrad/span.html",
        "https://brocku.ca/webcal/2024/undergrad/spma.html",
        "https://brocku.ca/webcal/2024/undergrad/stac.html",
        "https://brocku.ca/webcal/2024/undergrad/stat.html",
        "https://brocku.ca/webcal/2024/undergrad/step.html",
        "https://brocku.ca/webcal/2024/undergrad/tour.html",
        "https://brocku.ca/webcal/2024/undergrad/visa.html",
        "https://brocku.ca/webcal/2024/undergrad/wgst.html",
        "https://brocku.ca/webcal/2024/undergrad/wrds.html",
        "https://brocku.ca/webcal/2024/undergrad/wise.html",
    
    ]
    
    scrape_and_store_courses(urls_to_scrape)