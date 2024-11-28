import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectPlanningComponent } from './project-planning.component';

describe('ProjectPlanningComponent', () => {
  let component: ProjectPlanningComponent;
  let fixture: ComponentFixture<ProjectPlanningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectPlanningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectPlanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
