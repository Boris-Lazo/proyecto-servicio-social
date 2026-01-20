import { test, expect } from '@playwright/test';

test.describe('Verificación de Traducción y Funcionamiento', () => {
  test('La página de inicio debe cargar correctamente', async ({ page }) => {
    await page.goto('http://localhost:4000/');
    await expect(page).toHaveTitle(/CENTRO ESCOLAR "CANTÓN EL AMATAL"/);
    await expect(page.locator('h1')).toContainText('CENTRO ESCOLAR "CANTÓN EL AMATAL"');
    await page.screenshot({ path: 'verificacion_inicio.png' });
  });

  test('La página de login debe cargar correctamente', async ({ page }) => {
    await page.goto('http://localhost:4000/login');
    await expect(page.locator('h2')).toContainText('Iniciar sesión');
    await page.screenshot({ path: 'verificacion_login.png' });
  });

  test('La página de documentos debe cargar correctamente', async ({ page }) => {
    await page.goto('http://localhost:4000/documentos');
    await expect(page.locator('h2')).toContainText('Documentos de Rendición de Cuentas');
    // Esperar a que el mensaje de carga desaparezca o aparezcan los documentos
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'verificacion_documentos.png' });
  });
});
