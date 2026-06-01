import { test, expect } from '@playwright/test';

test.describe('Criterio', () => {
  test('loads the sample issue and shows the synthesis', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.brand')).toHaveText('Criterio');
    await expect(page.locator('.synth-title')).toBeVisible();
    await expect(page.locator('.synth-meta')).toContainText('15 artículos');
  });

  test('navigates between sections', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Resúmenes' }).click();
    await expect(page.locator('.resume-card').first()).toBeVisible();

    await page.getByRole('button', { name: 'Artículos' }).click();
    const firstAccordion = page.locator('.accordion-btn').first();
    await firstAccordion.click();
    await expect(page.locator('.accordion-content.open').first()).toBeVisible();
  });

  test('debate: validates an answer inline and offers the Claude debate', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Debate' }).click();

    // Pick the first option, submit, and expect an inline correction.
    await page.locator('.option-btn').first().click();
    await page.getByRole('button', { name: 'Enviar respuesta' }).click();

    await expect(page.locator('.correction-box')).toBeVisible();
    await expect(page.locator('.correction-verdict')).toBeVisible();
    await expect(page.getByRole('button', { name: /Copiar debate para Claude/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Abrir Claude/ })).toHaveAttribute(
      'href',
      'https://claude.ai/new',
    );

    // The escalating prompt must be self-contained.
    await page.getByText('Ver / editar el prompt').click();
    await expect(page.locator('.prompt-textarea')).toContainText('[CRITERIO · Debate socrático');
  });

  test('debate: resumes progress after reload', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Debate' }).click();

    // Answer the first question and advance to the second.
    await page.locator('.option-btn').first().click();
    await page.getByRole('button', { name: 'Enviar respuesta' }).click();
    await page.getByRole('button', { name: /Siguiente pregunta/ }).click();
    await expect(page.locator('.debate-progress-label')).toContainText('Pregunta 2 de');

    // Reload: progress is restored from localStorage instead of resetting to Q1.
    await page.reload();
    await page.getByRole('button', { name: 'Debate' }).click();
    await expect(page.locator('.debate-progress-label')).toContainText('Pregunta 2 de');
  });

  test('import: the "Pedir a la IA" tab offers copyable instructions', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav').getByRole('button', { name: 'Importar' }).click();
    await page.locator('.modal').getByRole('tab', { name: 'Pedir a la IA' }).click();
    await expect(page.locator('.import-steps')).toBeVisible();
    await expect(
      page.locator('.modal').getByRole('button', { name: /Copiar instrucciones/ }),
    ).toBeVisible();
  });

  test('synthesis offers a share button', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.locator('.synth-share').getByRole('button', { name: 'Compartir' }),
    ).toBeVisible();
  });

  test('import modal rejects invalid JSON with a clear error', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav').getByRole('button', { name: 'Importar' }).click();
    await page.locator('.import-textarea').fill('{ not valid json');
    await page.locator('.modal').getByRole('button', { name: 'Importar' }).click();
    await expect(page.locator('.import-errors')).toBeVisible();
  });
});
