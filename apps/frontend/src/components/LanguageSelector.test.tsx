import { fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import i18n, { Language, setLanguage } from '../i18n';
import { renderWithProviders } from '../test/render';
import { LanguageSelector } from './LanguageSelector';

describe('LanguageSelector', () => {
  afterEach(() => setLanguage(Language.Es));

  it('shows the current language as ES and switches it', () => {
    renderWithProviders(<LanguageSelector />, '/es');
    const select = screen.getByLabelText('Idioma');
    expect(select).toHaveValue('es');
    expect(screen.getByRole('option', { name: 'ES' })).toBeInTheDocument();

    fireEvent.change(select, { target: { value: Language.En } });
    expect(i18n.language).toBe('en');
  });
});
