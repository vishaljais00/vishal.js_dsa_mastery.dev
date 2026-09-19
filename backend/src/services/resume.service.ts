import path from 'path';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

export interface ResumeAnalysisResult {
  score: number;
  keywordScore: number;
  sectionScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  sections: Record<string, boolean>;
  warnings: string[];
  recommendations: string[];
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx', '.txt']);
const STOP_WORDS = new Set([
  'and', 'the', 'with', 'for', 'from', 'that', 'this', 'your', 'you', 'are', 'our',
  'will', 'have', 'has', 'not', 'but', 'into', 'about', 'using', 'their', 'they',
  'years', 'year', 'work', 'team', 'job', 'role', 'must', 'should', 'can'
]);

export class ResumeService {
  public static async extractText(file: Express.Multer.File): Promise<string> {
    if (!file || file.size > MAX_FILE_SIZE) {
      throw new Error('Resume must be smaller than 5 MB');
    }

    const extension = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      throw new Error('Only PDF, DOCX, and TXT resumes are supported');
    }

    let text = '';
    if (extension === '.pdf') {
      const parser = new PDFParse({ data: file.buffer });
      const parsed = await parser.getText();
      text = parsed.text;
      await parser.destroy();
    } else if (extension === '.docx') {
      const parsed = await mammoth.extractRawText({ buffer: file.buffer });
      text = parsed.value;
    } else {
      text = file.buffer.toString('utf8');
    }

    const normalizedText = text.replace(/\s+/g, ' ').trim();
    if (normalizedText.length < 40) {
      throw new Error('Could not extract enough readable text from this resume');
    }
    return normalizedText;
  }

  public static analyze(resumeText: string, jobDescription: string): ResumeAnalysisResult {
    const normalizedResume = resumeText.toLowerCase();
    const keywords = this.extractKeywords(jobDescription);
    const matchedKeywords = keywords.filter(keyword => normalizedResume.includes(keyword));
    const missingKeywords = keywords.filter(keyword => !normalizedResume.includes(keyword));
    const keywordScore = keywords.length ? Math.round((matchedKeywords.length / keywords.length) * 100) : 0;

    const sectionNames = ['summary', 'experience', 'education', 'skills', 'projects'];
    const sections = sectionNames.reduce((result, section) => {
      result[section] = new RegExp(`\\b${section}\\b`, 'i').test(resumeText);
      return result;
    }, {} as Record<string, boolean>);
    const sectionScore = Math.round((Object.values(sections).filter(Boolean).length / sectionNames.length) * 100);

    const warnings: string[] = [];
    const recommendations: string[] = [];
    if (!sections.contact && !/@|\\+?\\d[\\d ()-]{7,}/.test(resumeText)) {
      warnings.push('Contact information was not clearly detected');
      recommendations.push('Add a clearly labeled email address and phone number');
    }
    if (!sections.experience) recommendations.push('Add an Experience section with measurable outcomes');
    if (!sections.skills) recommendations.push('Add a dedicated Skills section using job-relevant terms');
    if (!sections.projects) recommendations.push('Add projects that demonstrate the required skills');
    if (missingKeywords.length) {
      recommendations.push(`Consider adding relevant evidence for: ${missingKeywords.slice(0, 5).join(', ')}`);
    }
    if (resumeText.length < 500) warnings.push('Resume content appears brief for ATS screening');
    if (resumeText.length > 12000) warnings.push('Resume is unusually long and may be difficult to scan');

    const score = Math.max(0, Math.min(100, Math.round(keywordScore * 0.7 + sectionScore * 0.3)));
    return {
      score,
      keywordScore,
      sectionScore,
      matchedKeywords,
      missingKeywords,
      sections,
      warnings,
      recommendations
    };
  }

  private static extractKeywords(jobDescription: string): string[] {
    const words = jobDescription.toLowerCase().match(/[a-z][a-z0-9+#.-]{1,}/g) || [];
    return [...new Set(words.filter(word => word.length > 2 && !STOP_WORDS.has(word)))].slice(0, 80);
  }
}
