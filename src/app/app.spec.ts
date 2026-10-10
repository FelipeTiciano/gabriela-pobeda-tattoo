import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App - Agenda de Tatuagens', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('deve criar a aplicação', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deve inicializar a agenda', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app.agendamentos).toBeDefined();
   expect(Array.isArray(app.agendamentos)).toBe(true);
  });
});