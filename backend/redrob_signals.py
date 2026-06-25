import math
from datetime import datetime
from typing import Dict, List, Tuple
import networkx as nx
from scipy.stats import entropy

BANNED_COMPANIES = {'tcs', 'infosys', 'wipro', 'accenture', 'cognizant', 'capgemini'}

class VerifyProfileIntegrity:
    def __init__(self):
        self.banned_companies = BANNED_COMPANIES

    def is_valid(self, candidate: Dict) -> bool:
        # 1. Years of experience calendar check
        profile = candidate.get('profile', {}) or candidate
        years_of_experience = profile.get('years_of_experience', profile.get('years_experience', 0))
        if years_of_experience is None: 
            years_of_experience = 0
        try:
            years_of_experience = float(years_of_experience)
        except (ValueError, TypeError):
            years_of_experience = 0
            
        career_history = candidate.get('career_history', [])
        if career_history:
            earliest_year = 9999
            for job in career_history:
                start_date = job.get('start_date')
                if start_date:
                    try:
                        year = int(start_date.split('-')[0])
                        if year < earliest_year:
                            earliest_year = year
                    except (ValueError, TypeError, IndexError):
                        pass
            if earliest_year != 9999:
                delta = 2026 - (earliest_year - 2)
                if years_of_experience > delta:
                    return False
                    
        # 2. Expert skills trap (profile inflation check)
        skills = candidate.get('skills', [])
        expert_skills = []
        if isinstance(skills, list):
            for s in skills:
                if isinstance(s, dict) and s.get('proficiency') == 'expert':
                    expert_skills.append(s)
                elif isinstance(s, str):
                    # In case skills is flat string array, we don't have proficiency
                    pass
        if len(expert_skills) >= 4:
            if all(s.get('duration_months', -1) == 0 for s in expert_skills):
                return False
                
        # 3. Outsourcing block
        current_company = profile.get('current_company')
        if current_company:
            current_company = current_company.lower()
            if any(banned in current_company for banned in self.banned_companies):
                return False
            
        return True

def get_seniority_level(title: str) -> int:
    title = title.lower() if title else ""
    if any(x in title for x in ['intern', 'trainee', 'student']):
        return 1
    if any(x in title for x in ['junior', 'associate', 'entry']):
        return 2
    if any(x in title for x in ['senior', 'sr', 'staff', 'principal', 'lead']):
        return 4
    if any(x in title for x in ['manager', 'director', 'vp', 'head', 'chief', 'ceo', 'cto']):
        return 5
    return 3 # Mid level by default

def calculate_career_velocity(career_history: List[Dict]) -> Dict[str, float]:
    if not career_history or len(career_history) < 2:
        return {'max_promotion_velocity': 0.0, 'avg_time_in_role_months': 0.0}
        
    G = nx.DiGraph()
    
    # Sort history chronologically
    sorted_jobs = []
    for job in career_history:
        if not isinstance(job, dict):
            continue
        start_date = job.get('start_date')
        if start_date:
            try:
                # support YYYY-MM-DD or YYYY-MM
                if len(start_date.split('-')) == 2:
                    dt = datetime.strptime(start_date, '%Y-%m')
                else:
                    dt = datetime.strptime(start_date, '%Y-%m-%d')
                sorted_jobs.append((dt, job))
            except ValueError:
                # fallback simple parsing
                try:
                    parts = [int(p) for p in start_date.split('-')]
                    dt = datetime(parts[0], parts[1], 1)
                    sorted_jobs.append((dt, job))
                except Exception:
                    pass
    sorted_jobs.sort(key=lambda x: x[0])
    
    velocities = []
    total_months = 0
    roles_count = len(sorted_jobs)
    
    for i in range(len(sorted_jobs)):
        dt_i, job_i = sorted_jobs[i]
        title_i = job_i.get('title', job_i.get('current_title', ''))
        sen_i = get_seniority_level(title_i)
        duration_i = job_i.get('duration_months') or 0
        try:
            duration_i = int(duration_i)
        except (ValueError, TypeError):
            duration_i = 0
        total_months += duration_i
        
        G.add_node(i, title=title_i, seniority=sen_i, duration=duration_i)
        
        if i > 0:
            dt_prev, job_prev = sorted_jobs[i-1]
            sen_prev = get_seniority_level(job_prev.get('title', job_prev.get('current_title', '')))
            
            # Months between starts
            delta_months = max(1, (dt_i - dt_prev).days / 30.0)
            sen_delta = max(0, sen_i - sen_prev)
            
            velocity = sen_delta / delta_months
            velocities.append(velocity)
            G.add_edge(i-1, i, weight=velocity)
            
    max_velocity = max(velocities) if velocities else 0.0
    avg_time = total_months / roles_count if roles_count > 0 else 0.0
    
    return {'max_promotion_velocity': max_velocity, 'avg_time_in_role_months': avg_time}

def calculate_intent_score(redrob_signals: Dict, last_active_val: str = None) -> float:
    recruiter_response_rate = redrob_signals.get('recruiter_response_rate')
    if recruiter_response_rate is None: 
        recruiter_response_rate = 0.0
    try:
        recruiter_response_rate = float(recruiter_response_rate)
    except (ValueError, TypeError):
        recruiter_response_rate = 0.0
        
    avg_response_time_hours = redrob_signals.get('avg_response_time_hours')
    if avg_response_time_hours is None: 
        avg_response_time_hours = 72.0
    try:
        avg_response_time_hours = float(avg_response_time_hours)
    except (ValueError, TypeError):
        avg_response_time_hours = 72.0
        
    last_active_date_str = redrob_signals.get('last_active_date') or last_active_val
    
    latency_penalty = 1.0 / (1.0 + math.exp(0.04 * (avg_response_time_hours - 72.0)))
    
    decay_factor = 1.0
    reference_date = datetime(2026, 6, 23)
    if last_active_date_str:
        try:
            last_active_date_str = str(last_active_date_str).split('T')[0]
            if len(last_active_date_str.split('-')) == 3:
                last_active_date = datetime.strptime(last_active_date_str, '%Y-%m-%d')
            elif len(last_active_date_str.split('/')) == 3:
                last_active_date = datetime.strptime(last_active_date_str, '%Y/%m/%d')
            else:
                last_active_date = reference_date
            days_since_active = (reference_date - last_active_date).days
            decay_factor = math.exp(-0.01 * max(0, days_since_active))
        except Exception:
            pass
            
    intent_score = recruiter_response_rate * latency_penalty * decay_factor
    return intent_score

def calculate_hidden_gem_score(skills: List, skill_probs: Dict[str, float]) -> float:
    candidate_skill_probs = []
    for s in skills:
        name = s.get('name') if isinstance(s, dict) else str(s)
        if name and name.lower() in skill_probs:
            candidate_skill_probs.append(skill_probs[name.lower()])
    
    hidden_gem_index_score = 0.0
    if candidate_skill_probs:
        norm_factor = sum(candidate_skill_probs)
        if norm_factor > 0:
            norm_probs = [p / norm_factor for p in candidate_skill_probs]
            hidden_gem_index_score = float(entropy(norm_probs))
            avg_rarity = -1.0 * sum(math.log2(p) for p in candidate_skill_probs) / len(candidate_skill_probs)
            hidden_gem_index_score += float(avg_rarity)
            
    return hidden_gem_index_score
