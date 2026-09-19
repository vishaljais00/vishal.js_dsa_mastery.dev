import { Routes } from '@angular/router';
import { RoadmapComponent } from './pages/roadmap/roadmap.component';
import { ProblemViewComponent } from './pages/problem-view/problem-view.component';
import { CheatSheetComponent } from './pages/cheat-sheet/cheat-sheet.component';
import { InterviewTestComponent } from './pages/interview-test/interview-test.component';
import { AdminComponent } from './pages/admin/admin.component';
import { MockHistoryComponent } from './pages/mock-history/mock-history.component';
import { LeaderboardComponent } from './pages/leaderboard/leaderboard.component';
import { GuidebookComponent } from './pages/guidebook/guidebook.component';
import { PlaygroundComponent } from './pages/playground/playground.component';
import { ResumeAnalyzerComponent } from './pages/resume-analyzer/resume-analyzer.component';

export const routes: Routes = [
  { path: '', component: RoadmapComponent },
  { path: 'problem/:id', component: ProblemViewComponent },
  { path: 'guidebook', component: GuidebookComponent },
  { path: 'playground', component: PlaygroundComponent },
  { path: 'resume-analyzer', component: ResumeAnalyzerComponent },
  { path: 'cheat-sheet', component: CheatSheetComponent },
  { path: 'interview-test', component: InterviewTestComponent },
  { path: 'mock-history', component: MockHistoryComponent },
  { path: 'leaderboard', component: LeaderboardComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: '' }
];


