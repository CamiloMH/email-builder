import { DEFAULT_THEME, createDefaultTemplate } from '@email/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useBrandKitsStore } from '../../store/brand-kits-store';
import { useBuilderStore } from '../../store/builder-store';
import { ThemePanel } from './ThemePanel';

const theme = () => useBuilderStore.getState().document?.theme;

beforeEach(() => {
  localStorage.clear();
  useBrandKitsStore.setState({ kits: [] });
  useBuilderStore.getState().setDocument(createDefaultTemplate());
});

describe('ThemePanel', () => {
  it('edits a palette color', () => {
    render(<ThemePanel />);
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar color Primario' }));
    fireEvent.change(screen.getByLabelText('Hex Primario'), { target: { value: '#123456' } });
    expect(theme()?.colors.primary).toBe('#123456');
  });

  it('edits the layout spacing via a slider', () => {
    render(<ThemePanel />);
    const sliders = screen.getAllByRole('slider');
    fireEvent.change(sliders[1] as HTMLElement, { target: { value: '40' } });
    expect(theme()?.layout.spacing).toBe(40);
  });

  it('changes the font family and embeds a web font only for web fonts', () => {
    render(<ThemePanel />);
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: "Georgia, 'Times New Roman', serif" },
    });
    expect(theme()?.typography.fontFamily).toContain('Georgia');
    expect(theme()?.typography.fontUrl).toBeUndefined();

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: "'Inter', system-ui, sans-serif" },
    });
    expect(theme()?.typography.fontUrl).toContain('fonts.googleapis.com');
  });

  it('highlights the hovered color in the preview', () => {
    render(<ThemePanel />);
    const swatch = screen.getByRole('button', { name: 'Cambiar color Primario' });
    const wrapper = swatch.closest('.relative')?.parentElement as HTMLElement;

    fireEvent.mouseEnter(wrapper);
    expect(useBuilderStore.getState().highlightColor).toBe(theme()?.colors.primary);

    fireEvent.mouseLeave(wrapper);
    expect(useBuilderStore.getState().highlightColor).toBeNull();
  });

  it('saves the current theme as a brand kit and re-applies it', () => {
    render(<ThemePanel />);
    fireEvent.change(screen.getByLabelText('Nombre del brand kit'), { target: { value: 'Marca A' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar tema actual' }));

    // Change a color, then re-apply the saved kit to restore it.
    useBuilderStore.getState().updateTheme({
      ...DEFAULT_THEME,
      colors: { ...DEFAULT_THEME.colors, primary: '#FF0000' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar Marca A' }));
    expect(theme()?.colors.primary).toBe(DEFAULT_THEME.colors.primary);
  });

  it('warns about low-contrast color pairs', () => {
    useBuilderStore.getState().setDocument({
      ...createDefaultTemplate(),
      theme: { ...DEFAULT_THEME, colors: { ...DEFAULT_THEME.colors, text: '#EEEEEE' } },
    });
    render(<ThemePanel />);
    expect(screen.getAllByText(/Contraste bajo/).length).toBeGreaterThan(0);
  });

  it('enables an email dark-mode palette', () => {
    render(<ThemePanel />);
    fireEvent.click(screen.getByLabelText('Modo oscuro del email'));
    expect(theme()?.darkMode).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cambiar color Fondo oscuro' })).toBeInTheDocument();
  });
});
