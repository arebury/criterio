import { test } from '@playwright/test';

// Not part of CI — a visual-review helper. Run with:
//   npx playwright test e2e/screenshots.spec.ts
// page.screenshot() creates parent directories automatically.
const DIR = 'test-results/shots';

test.describe('visual capture', () => {
  test('desktop views', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    await page.waitForSelector('.synth-title');
    await page.screenshot({ path: `${DIR}/01-sintesis.png`, fullPage: true });

    await page.getByRole('button', { name: 'Resúmenes' }).click();
    await page.screenshot({ path: `${DIR}/02-resumenes.png`, fullPage: true });

    await page.getByRole('button', { name: 'Artículos' }).click();
    await page.locator('.accordion-btn').first().click();
    await page.locator('.accordion-btn').nth(1).click();
    await page.screenshot({ path: `${DIR}/03-articulos.png`, fullPage: true });

    await page.getByRole('button', { name: 'Debate' }).click();
    await page.screenshot({ path: `${DIR}/04-debate.png` });
    await page.locator('.option-btn').first().click();
    await page.getByRole('button', { name: 'Enviar respuesta' }).click();
    await page.waitForSelector('.correction-box');
    await page.screenshot({ path: `${DIR}/05-debate-correccion.png`, fullPage: true });

    await page.getByRole('button', { name: /Ajustes/ }).click();
    await page.waitForSelector('.modal');
    await page.screenshot({ path: `${DIR}/06-ajustes.png` });
    await page.locator('.modal-close').click();

    await page.locator('nav').getByRole('button', { name: 'Importar' }).click();
    await page.waitForSelector('.modal');
    await page.screenshot({ path: `${DIR}/07-importar.png` });
    await page.locator('.modal-close').click();

    await page.getByRole('button', { name: /Modo lectura/ }).click();
    await page.screenshot({ path: `${DIR}/08-modo-lectura.png`, fullPage: true });
  });

  test('mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForSelector('.synth-title');
    await page.screenshot({ path: `${DIR}/09-mobile-sintesis.png`, fullPage: true });
    await page.getByRole('button', { name: 'Resúmenes' }).click();
    await page.screenshot({ path: `${DIR}/10-mobile-resumenes.png`, fullPage: true });
  });
});
