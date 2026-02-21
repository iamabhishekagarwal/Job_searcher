import spacy
import re
import os
import sys
import subprocess
from collections import Counter

def install_package(package):
    """Install package if not available."""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✅ {package} installed successfully")
    except Exception as e:
        print(f"❌ Failed to install {package}: {e}")

# Install SkillNER and its dependencies for advanced skills extraction
try:
    from skillNer.general_params import SKILL_DB
    from skillNer.skill_extractor_class import SkillExtractor
    print("✅ SkillNER already installed")
    SKILLNER_AVAILABLE = True
except ImportError as e:
    print(f"📦 Installing SkillNER and dependencies...")
    try:
        # Install required dependencies first
        install_package("ipython")
        install_package("jupyter")
        install_package("skillNer")
        
        # Try importing again
        from skillNer.general_params import SKILL_DB
        from skillNer.skill_extractor_class import SkillExtractor
        print("✅ SkillNER installed successfully")
        SKILLNER_AVAILABLE = True
    except Exception as install_error:
        print(f"⚠️ SkillNER installation failed: {install_error}")
        print("📝 Will use manual skills extraction instead")
        SKILLNER_AVAILABLE = False
        SKILL_DB = None
        SkillExtractor = None

def setup_spacy():
    """Setup spaCy and required models."""
    try:
        import spacy
        try:
            nlp = spacy.load("en_core_web_sm")
            print("✅ spaCy model loaded successfully")
            return nlp
        except OSError:
            print("📦 Installing spaCy English model...")
            subprocess.check_call([sys.executable, "-m", "spacy", "download", "en_core_web_sm"])
            nlp = spacy.load("en_core_web_sm")
            return nlp
    except ImportError:
        print("📦 Installing spaCy...")
        install_package("spacy")
        subprocess.check_call([sys.executable, "-m", "spacy", "download", "en_core_web_sm"])
        import spacy
        return spacy.load("en_core_web_sm")

try:
    import PyPDF2
except ImportError:
    print("📦 Installing PyPDF2...")
    install_package("PyPDF2")
    import PyPDF2

class ImprovedResumeParser:
    """Improved Resume parser with accurate field extraction using SkillNER."""
    
    def __init__(self):
        """Initialize the parser with spaCy model and SkillNER."""
        print("🚀 Initializing Improved Resume Parser with SkillNER...")
        self.nlp = setup_spacy()
        
        # Initialize SkillNER for advanced skills extraction
        if SKILLNER_AVAILABLE:
            try:
                print("🔧 Setting up SkillNER...")
                # Import PhraseMatcher here to ensure it's available
                from spacy.matcher import PhraseMatcher
                self.skill_extractor = SkillExtractor(self.nlp, SKILL_DB, PhraseMatcher)
                print("✅ SkillNER initialized successfully")
                self.use_skillner = True
            except Exception as e:
                print(f"⚠️ SkillNER initialization failed: {e}")
                print("📝 Falling back to manual skills extraction")
                self.skill_extractor = None
                self.use_skillner = False
        else:
            print("📝 SkillNER not available, using manual skills extraction")
            self.skill_extractor = None
            self.use_skillner = False
            
            # Fallback comprehensive technical skills database
            self.technical_skills = {
                'programming_languages': [
                    'python', 'java', 'javascript', 'c++', 'c#', 'c', 'php', 'ruby', 'go', 'rust',
                    'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'shell', 'bash', 'powershell',
                    'typescript', 'dart', 'objective-c', 'assembly', 'cobol', 'fortran', 'lua', 'groovy'
                ],
                'web_technologies': [
                    'html', 'css', 'javascript', 'typescript', 'react', 'angular', 'vue.js', 'vue',
                    'node.js', 'nodejs', 'express.js', 'express', 'django', 'flask', 'spring boot', 'spring',
                    'laravel', 'rails', 'ruby on rails', 'next.js', 'nuxt.js', 'gatsby', 'svelte',
                    'bootstrap', 'tailwind css', 'sass', 'scss', 'less', 'jquery', 'ajax', 'rest api',
                    'graphql', 'webpack', 'vite', 'gulp', 'grunt'
                ],
                'databases': [
                    'mysql', 'postgresql', 'postgres', 'mongodb', 'sqlite', 'redis', 'oracle',
                    'sql server', 'microsoft sql server', 'elasticsearch', 'cassandra', 'dynamodb',
                    'neo4j', 'couchdb', 'firebase', 'mariadb', 'influxdb', 'clickhouse'
                ],
                'cloud_devops': [
                    'aws', 'amazon web services', 'azure', 'microsoft azure', 'gcp', 'google cloud',
                    'docker', 'kubernetes', 'jenkins', 'git', 'gitlab', 'github', 'ci/cd', 'terraform',
                    'ansible', 'puppet', 'chef', 'vagrant', 'helm', 'istio', 'nginx', 'apache',
                    'linux', 'unix', 'ubuntu', 'centos', 'debian', 'redhat'
                ],
                'data_science': [
                    'machine learning', 'deep learning', 'artificial intelligence', 'data science',
                    'tensorflow', 'pytorch', 'keras', 'pandas', 'numpy', 'scikit-learn', 'sklearn',
                    'matplotlib', 'seaborn', 'plotly', 'jupyter', 'anaconda', 'spark', 'hadoop',
                    'tableau', 'power bi', 'excel', 'statistics', 'data analysis', 'data visualization'
                ],
                'mobile_development': [
                    'android', 'ios', 'react native', 'flutter', 'xamarin', 'cordova', 'phonegap',
                    'ionic', 'swift', 'objective-c', 'kotlin', 'java'
                ],
                'testing_tools': [
                    'selenium', 'junit', 'testng', 'pytest', 'jest', 'mocha', 'cypress', 'cucumber',
                    'postman', 'soap ui', 'jmeter', 'loadrunner'
                ],
                'other_tools': [
                    'jira', 'confluence', 'slack', 'trello', 'asana', 'photoshop', 'illustrator',
                    'figma', 'sketch', 'zeplin', 'invision', 'adobe xd', 'canva'
                ]
            }
            
            # Compile all skills into one list for matching
            self.all_skills = []
            for category in self.technical_skills.values():
                self.all_skills.extend(category)
            
            # Convert to lowercase for matching
            self.all_skills = list(set([skill.lower() for skill in self.all_skills]))
        # Always initialize the fallback skills database
        self.technical_skills = {
            'programming_languages': [
                'python', 'java', 'javascript', 'c++', 'c#', 'c', 'php', 'ruby', 'go', 'rust',
                'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'shell', 'bash', 'powershell',
                'typescript', 'dart', 'objective-c', 'assembly', 'cobol', 'fortran', 'lua', 'groovy'
            ],
            'web_technologies': [
                'html', 'css', 'javascript', 'typescript', 'react', 'angular', 'vue.js', 'vue',
                'node.js', 'nodejs', 'express.js', 'express', 'django', 'flask', 'spring boot', 'spring',
                'laravel', 'rails', 'ruby on rails', 'next.js', 'nuxt.js', 'gatsby', 'svelte',
                'bootstrap', 'tailwind css', 'sass', 'scss', 'less', 'jquery', 'ajax', 'rest api',
                'graphql', 'webpack', 'vite', 'gulp', 'grunt'
            ],
            'databases': [
                'mysql', 'postgresql', 'postgres', 'mongodb', 'sqlite', 'redis', 'oracle',
                'sql server', 'microsoft sql server', 'elasticsearch', 'cassandra', 'dynamodb',
                'neo4j', 'couchdb', 'firebase', 'mariadb', 'influxdb', 'clickhouse'
            ],
            'cloud_devops': [
                'aws', 'amazon web services', 'azure', 'microsoft azure', 'gcp', 'google cloud',
                'docker', 'kubernetes', 'jenkins', 'git', 'gitlab', 'github', 'ci/cd', 'terraform',
                'ansible', 'puppet', 'chef', 'vagrant', 'helm', 'istio', 'nginx', 'apache',
                'linux', 'unix', 'ubuntu', 'centos', 'debian', 'redhat'
            ],
            'data_science': [
                'machine learning', 'deep learning', 'artificial intelligence', 'data science',
                'tensorflow', 'pytorch', 'keras', 'pandas', 'numpy', 'scikit-learn', 'sklearn',
                'matplotlib', 'seaborn', 'plotly', 'jupyter', 'anaconda', 'spark', 'hadoop',
                'tableau', 'power bi', 'excel', 'statistics', 'data analysis', 'data visualization'
            ],
            'mobile_development': [
                'android', 'ios', 'react native', 'flutter', 'xamarin', 'cordova', 'phonegap',
                'ionic', 'swift', 'objective-c', 'kotlin', 'java'
            ],
            'testing_tools': [
                'selenium', 'junit', 'testng', 'pytest', 'jest', 'mocha', 'cypress', 'cucumber',
                'postman', 'soap ui', 'jmeter', 'loadrunner'
            ],
            'other_tools': [
                'jira', 'confluence', 'slack', 'trello', 'asana', 'photoshop', 'illustrator',
                'figma', 'sketch', 'zeplin', 'invision', 'adobe xd', 'canva'
            ]
        }
        
        # Compile all skills into one list for matching
        self.all_skills = []
        for category in self.technical_skills.values():
            self.all_skills.extend(category)
        
        # Convert to lowercase for matching
        self.all_skills = list(set([skill.lower() for skill in self.all_skills]))
        
        print(f"✅ Parser initialized successfully")
    
    def extract_text_from_pdf(self, pdf_path):
        """Extract text from PDF using PyPDF2."""
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                return text
        except Exception as e:
            print(f"❌ Error extracting PDF text: {e}")
            return None
    
    def extract_name(self, doc):
        """Extract first and last name more accurately."""
        # Get first few lines where names are typically located
        lines = doc.text.split('\n')[:5]
        header_text = ' '.join(lines)
        
        # Process header text with spacy
        header_doc = self.nlp(header_text)
        
        # Look for person entities in header
        potential_names = []
        for ent in header_doc.ents:
            if ent.label_ == "PERSON":
                name = ent.text.strip()
                # Filter out common false positives
                if (len(name.split()) <= 3 and 
                    len(name) > 2 and 
                    not any(skill in name.lower() for skill in ['java', 'python', 'react']) and
                    not re.search(r'\d|@|\.com', name.lower())):
                    potential_names.append(name)
        
        # If no good names found in entities, try first line patterns
        if not potential_names:
            first_line = lines[0].strip() if lines else ""
            # Remove common prefixes/suffixes
            clean_line = re.sub(r'\b(resume|cv|curriculum vitae)\b', '', first_line, flags=re.IGNORECASE)
            words = clean_line.split()
            
            # Look for 2-3 consecutive capitalized words
            if 2 <= len(words) <= 4:
                if all(word[0].isupper() and word.isalpha() for word in words):
                    potential_names.append(' '.join(words))
        
        # Extract first and last name
        if potential_names:
            full_name = potential_names[0]
            name_parts = full_name.split()
            first_name = name_parts[0] if name_parts else ""
            last_name = name_parts[-1] if len(name_parts) > 1 else ""
            return first_name, last_name
        
        return "", ""
    
    def extract_contact_info(self, doc):
        """Extract email and phone number."""
        text = doc.text
        
        # Extract emails
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text)
        email = emails[0] if emails else ""
        
        # Extract phone numbers with better patterns
        phone_patterns = [
            r'(\+\d{1,3}[-.\s]?)?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})',
            r'(\+\d{1,3}[-.\s]?)?(\d{10})',
            r'(\+\d{1,3}[-.\s]?)?(\d{3})[-.\s]?(\d{3})[-.\s]?(\d{4})'
        ]
        
        phones = []
        for pattern in phone_patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                if isinstance(match, tuple):
                    phone = ''.join(match)
                else:
                    phone = match
                # Clean phone number
                digits_only = re.sub(r'\D', '', phone)
                if 10 <= len(digits_only) <= 15:
                    phones.append(phone)
        
        phone = phones[0] if phones else ""
        
        return email, phone
    
    def extract_skills_accurately(self, doc):
        """Extract technical skills using SkillNER and fallback methods."""
        
        # Method 1: Try SkillNER first (most accurate)
        if self.use_skillner and self.skill_extractor:
            try:
                print("🧠 Using SkillNER for skills extraction...")
                # SkillNER expects text, not doc object
                text = doc.text
                annotations = self.skill_extractor.annotate(text)
                
                # Extract skills from SkillNER output
                skillner_skills = []
                if 'results' in annotations:
                    if 'full_matches' in annotations['results']:
                        for match in annotations['results']['full_matches']:
                            skill = match['doc_node_value'].strip()
                            if skill and len(skill) > 1:
                                skillner_skills.append(skill.title())
                    
                    if 'ngram_scored' in annotations['results']:
                        for match in annotations['results']['ngram_scored']:
                            skill = match['doc_node_value'].strip() 
                            if skill and len(skill) > 1 and match['score'] > 0.7:  # Only high confidence matches
                                skillner_skills.append(skill.title())
                
                # Remove duplicates while preserving order
                skillner_skills = list(dict.fromkeys(skillner_skills))
                
                if skillner_skills:
                    print(f"✅ SkillNER found {len(skillner_skills)} skills")
                    return skillner_skills
                else:
                    print("⚠️ SkillNER found no skills, using fallback method")
                    
            except Exception as e:
                print(f"⚠️ SkillNER failed: {e}, using fallback method")
        
        # Method 2: Fallback to manual extraction if SkillNER fails or finds nothing
        print("🔍 Using manual skills extraction...")
        text_lower = doc.text.lower()
        found_skills = set()
        
        # Direct matching with word boundaries
        for skill in self.all_skills:
            # Use word boundaries for single words, phrase matching for multi-word skills
            if ' ' in skill:
                # Multi-word skill - look for exact phrase
                if skill in text_lower:
                    found_skills.add(skill)
            else:
                # Single word skill - use word boundaries to avoid partial matches
                pattern = r'\b' + re.escape(skill) + r'\b'
                if re.search(pattern, text_lower):
                    found_skills.add(skill)
        
        # Look specifically in skills section
        skills_section = self.extract_skills_section_text(text_lower)
        if skills_section:
            for skill in self.all_skills:
                if ' ' in skill:
                    if skill in skills_section:
                        found_skills.add(skill)
                else:
                    pattern = r'\b' + re.escape(skill) + r'\b'
                    if re.search(pattern, skills_section):
                        found_skills.add(skill)
        
        # Convert to proper case and sort
        skills_list = [skill.title() for skill in sorted(found_skills)]
        
        # Additional cleaning - remove very common false positives
        cleaned_skills = []
        for skill in skills_list:
            # Skip if it's likely a false positive
            if skill.lower() not in ['and', 'or', 'with', 'using', 'work', 'experience']:
                cleaned_skills.append(skill)
        
        print(f"✅ Manual extraction found {len(cleaned_skills)} skills")
        return cleaned_skills
    
    def extract_skills_section_text(self, text_lower):
        """Extract text from skills section."""
        skills_patterns = [
            r'(?:technical\s+)?skills?\s*:([^:]*?)(?=\n\s*[A-Za-z]+\s*:|$)',
            r'core\s+competencies\s*:([^:]*?)(?=\n\s*[A-Za-z]+\s*:|$)',
            r'technologies\s*:([^:]*?)(?=\n\s*[A-Za-z]+\s*:|$)',
            r'programming\s+(?:languages?\s*)?:([^:]*?)(?=\n\s*[A-Za-z]+\s*:|$)',
        ]
        
        for pattern in skills_patterns:
            match = re.search(pattern, text_lower, re.DOTALL)
            if match:
                return match.group(1).strip()
        
        return None
    
    def extract_experience_years(self, doc):
        """Extract years of experience more accurately."""
        text_lower = doc.text.lower()
        
        # Patterns for experience
        experience_patterns = [
            r'(\d+)\+?\s*years?\s+(?:of\s+)?(?:professional\s+)?(?:work\s+)?experience',
            r'(?:over\s+|more than\s+)?(\d+)\+?\s*years?\s+(?:of\s+)?experience',
            r'experience\s*:?\s*(\d+)\+?\s*years?',
            r'(\d+)\+?\s*years?\s+(?:of\s+)?(?:software\s+)?(?:development\s+)?(?:programming\s+)?experience',
            r'(?:total\s+)?experience\s*:?\s*(\d+)\+?\s*years?'
        ]
        
        years_found = []
        for pattern in experience_patterns:
            matches = re.findall(pattern, text_lower)
            for match in matches:
                try:
                    years = int(match)
                    if 0 <= years <= 50:  # Reasonable range
                        years_found.append(years)
                except ValueError:
                    continue
        
        # Return the maximum years found, or 0 if none
        return max(years_found) if years_found else 0
    
    def parse_resume(self, file_path):
        """Main method to parse a resume file."""
        print(f"\n🎯 Analyzing resume: {os.path.basename(file_path)}")
        print("-" * 50)
        
        if not os.path.exists(file_path):
            print(f"❌ File not found: {file_path}")
            return None
        
        # Extract text
        print("📄 Extracting text from PDF...")
        text = self.extract_text_from_pdf(file_path)
        
        if not text:
            print("❌ Could not extract text from file")
            return None
        
        print(f"✅ Extracted {len(text)} characters")
        
        # Process with spaCy
        print("🧠 Processing with spaCy NLP...")
        doc = self.nlp(text)
        print(f"✅ Processed {len(doc)} tokens")
        
        # Extract the 6 key pieces of information
        print("🔍 Extracting key information...")
        
        first_name, last_name = self.extract_name(doc)
        email, phone = self.extract_contact_info(doc)
        skills = self.extract_skills_accurately(doc)
        exp_years = self.extract_experience_years(doc)
        
        results = {
            'first_name': first_name,
            'last_name': last_name,
            'email': email,
            'phone': phone,
            'skills': skills,
            'exp_years': exp_years
        }
        
        print("✅ Analysis complete!")
        return results
    
    def display_results(self, results):
        """Display parsing results in a clean format."""
        print("\n" + "="*60)
        print("📋 IMPROVED RESUME PARSING RESULTS")
        print("="*60)
        
        print(f"👤 First Name: {results['first_name'] or 'Not found'}")
        print(f"👤 Last Name: {results['last_name'] or 'Not found'}")
        print(f"📧 Email: {results['email'] or 'Not found'}")
        print(f"📱 Phone: {results['phone'] or 'Not found'}")
        print(f"💼 Experience: {results['exp_years']} years")
        
        skills = results['skills']
        if skills:
            print(f"\n🛠️ Skills ({len(skills)}):")
            for i, skill in enumerate(skills, 1):
                print(f"   {i:2d}. {skill}")
        else:
            print("\n🛠️ Skills: None detected")
        
        print("="*60)
        
        # Clean output format
        print(type(results))
        print(f"\n📋 CLEAN DATA OUTPUT:")
        print("-" * 40)
        print(f"first_name: '{results['first_name']}'")
        print(f"last_name: '{results['last_name']}'")
        print(f"email: '{results['email']}'")
        print(f"phone: '{results['phone']}'")
        print(f"exp_years: {results['exp_years']}")
        print(f"skills: {results['skills']}")

def main():
    """Main execution function."""
    print("🚀 IMPROVED RESUME PARSER")
    print("=" * 50)
    
    try:
        # Initialize parser
        parser = ImprovedResumeParser()
        
        # Your resume file - CHANGE THIS!
        resume_file = "Shridhi_Gupta_Resume (1).pdf"
        
        # Parse the resume
        results = parser.parse_resume(resume_file)
        
        if results:
            # Display results
            parser.display_results(results)
            print(f"\nSuccess")
        else:
            print("❌ Failed to parse resume")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print("🔧 Make sure all dependencies are installed")

if __name__ == "__main__":
    main()
   