import { Routes } from '@angular/router';
import { RoadmapComponent } from './pages/roadmap/roadmap.component';
import { ProblemViewComponent } from './pages/problem-view/problem-view.component';
import { CheatSheetComponent } from './pages/cheat-sheet/cheat-sheet.component';
import { InterviewTestComponent } from './pages/interview-test/interview-test.component';
import { AdminComponent } from './pages/admin/admin.component';
import { MockHistoryComponent } from './pages/mock-history/mock-history.component';
import { LeaderboardComponent } from './pages/leaderboard/leaderboard.component';

export const routes: Routes = [
  { path: '', component: RoadmapComponent },
  { path: 'problem/:id', component: ProblemViewComponent },
  { path: 'cheat-sheet', component: CheatSheetComponent },
  { path: 'interview-test', component: InterviewTestComponent },
  { path: 'mock-history', component: MockHistoryComponent },
  { path: 'leaderboard', component: LeaderboardComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: '' }
];


