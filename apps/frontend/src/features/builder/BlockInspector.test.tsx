import {
  Align,
  BlockFactory,
  BlockType,
  ButtonVariant,
  DEFAULT_THEME,
  type Block,
} from '@email/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useBuilderStore } from '../../store/builder-store';
import { BlockInspector } from './BlockInspector';

const seedSelected = (block: Block): void => {
  useBuilderStore.getState().setDocument({ name: 'T', theme: DEFAULT_THEME, blocks: [block] });
  useBuilderStore.getState().selectBlock(block.id);
};

const selectedBlock = (): Block | undefined =>
  useBuilderStore
    .getState()
    .document?.blocks.find((b) => b.id === useBuilderStore.getState().selectedBlockId);

describe('BlockInspector', () => {
  it('shows a placeholder when no block is selected', () => {
    useBuilderStore.getState().reset();
    render(<BlockInspector />);
    expect(screen.getByText(/Selecciona un bloque/)).toBeInTheDocument();
  });

  it.each([
    [BlockType.Header, 'Título'],
    [BlockType.Text, 'Texto'],
    [BlockType.Image, 'URL de la imagen'],
    [BlockType.Button, 'Texto del botón'],
    [BlockType.Card, 'URL de imagen (opcional)'],
    [BlockType.Footer, 'Empresa'],
  ])('renders the %s form', (type, label) => {
    seedSelected(BlockFactory.create(type));
    render(<BlockInspector />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('shows a no-options message for dividers', () => {
    seedSelected(BlockFactory.create(BlockType.Divider));
    render(<BlockInspector />);
    expect(screen.getByText(/no tiene opciones/)).toBeInTheDocument();
  });

  it('edits a header title and alignment', () => {
    seedSelected(BlockFactory.create(BlockType.Header));
    render(<BlockInspector />);
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Hola' } });
    // The header has two alignment controls (logo + content); the last is content.
    const right = screen.getAllByRole('button', { name: 'Derecha' });
    fireEvent.click(right[right.length - 1] as HTMLElement);
    const props = selectedBlock()?.props as { title: string; align: string };
    expect(props.title).toBe('Hola');
    expect(props.align).toBe(Align.Right);
  });

  it('adds and removes columns', () => {
    seedSelected(BlockFactory.create(BlockType.Columns));
    render(<BlockInspector />);
    fireEvent.click(screen.getByRole('button', { name: 'Añadir columna' }));
    expect((selectedBlock()?.props as { columns: unknown[] }).columns).toHaveLength(3);
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar columna 3' }));
    expect((selectedBlock()?.props as { columns: unknown[] }).columns).toHaveLength(2);
  });

  it('edits a social link platform and adds one', () => {
    seedSelected(BlockFactory.create(BlockType.Social));
    render(<BlockInspector />);
    fireEvent.click(screen.getByRole('button', { name: 'Añadir enlace' }));
    expect((selectedBlock()?.props as { links: unknown[] }).links).toHaveLength(3);
  });

  it('edits header subtitle and logo', () => {
    seedSelected(BlockFactory.create(BlockType.Header));
    render(<BlockInspector />);
    fireEvent.change(screen.getByLabelText('Subtítulo'), { target: { value: 'Sub' } });
    fireEvent.change(screen.getByLabelText('URL del logo'), {
      target: { value: 'https://logo.png' },
    });
    const props = selectedBlock()?.props as { subtitle: string; logoUrl: string };
    expect(props.subtitle).toBe('Sub');
    expect(props.logoUrl).toBe('https://logo.png');
  });

  it('edits text content and font size', () => {
    seedSelected(BlockFactory.create(BlockType.Text));
    render(<BlockInspector />);
    fireEvent.change(screen.getByLabelText('Texto'), { target: { value: 'Hola mundo' } });
    fireEvent.change(screen.getByRole('slider'), { target: { value: '24' } });
    const props = selectedBlock()?.props as { text: string; fontSize: number };
    expect(props.text).toBe('Hola mundo');
    expect(props.fontSize).toBe(24);
  });

  it('edits image fields', () => {
    seedSelected(BlockFactory.create(BlockType.Image));
    render(<BlockInspector />);
    fireEvent.change(screen.getByLabelText('URL de la imagen'), {
      target: { value: 'https://img.png' },
    });
    fireEvent.change(screen.getByLabelText('Texto alternativo'), { target: { value: 'Alt' } });
    fireEvent.change(screen.getByLabelText('Enlace (opcional)'), {
      target: { value: 'https://link' },
    });
    fireEvent.change(screen.getByRole('slider'), { target: { value: '50' } });
    const props = selectedBlock()?.props as { src: string; alt: string; widthPercent: number };
    expect(props.src).toBe('https://img.png');
    expect(props.alt).toBe('Alt');
    expect(props.widthPercent).toBe(50);
  });

  it('edits button and spacer and footer fields', () => {
    seedSelected(BlockFactory.create(BlockType.Button));
    const { unmount } = render(<BlockInspector />);
    fireEvent.change(screen.getByLabelText('Texto del botón'), { target: { value: 'Vamos' } });
    fireEvent.change(screen.getByLabelText('Enlace'), { target: { value: 'https://go' } });
    expect((selectedBlock()?.props as { label: string }).label).toBe('Vamos');
    unmount();

    seedSelected(BlockFactory.create(BlockType.Spacer));
    const spacerView = render(<BlockInspector />);
    fireEvent.change(screen.getByRole('slider'), { target: { value: '80' } });
    expect((selectedBlock()?.props as { height: number }).height).toBe(80);
    spacerView.unmount();

    seedSelected(BlockFactory.create(BlockType.Footer));
    render(<BlockInspector />);
    fireEvent.change(screen.getByLabelText('Empresa'), { target: { value: 'ACME' } });
    fireEvent.change(screen.getByLabelText('Dirección'), { target: { value: 'Calle 1' } });
    fireEvent.change(screen.getByLabelText('Texto legal'), { target: { value: 'Legal' } });
    expect((selectedBlock()?.props as { companyName: string }).companyName).toBe('ACME');
  });

  it('edits column content and a social url', () => {
    seedSelected(BlockFactory.create(BlockType.Columns));
    const columnsView = render(<BlockInspector />);
    const headings = screen.getAllByLabelText('Encabezado');
    fireEvent.change(headings[0] as HTMLElement, { target: { value: 'Col A' } });
    const texts = screen.getAllByLabelText('Texto');
    fireEvent.change(texts[0] as HTMLElement, { target: { value: 'Cuerpo A' } });
    columnsView.unmount();

    seedSelected(BlockFactory.create(BlockType.Social));
    render(<BlockInspector />);
    const urls = screen.getAllByLabelText('URL');
    fireEvent.change(urls[0] as HTMLElement, { target: { value: 'https://x.com/acme' } });
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0] as HTMLElement, { target: { value: 'github' } });
    const links = (selectedBlock()?.props as { links: Array<{ url: string; platform: string }> })
      .links;
    expect(links[0]?.url).toBe('https://x.com/acme');
    expect(links[0]?.platform).toBe('github');
  });

  it('edits a button variant and full-width', () => {
    seedSelected(BlockFactory.create(BlockType.Button));
    render(<BlockInspector />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: ButtonVariant.Outline } });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Ancho completo' }));
    const props = selectedBlock()?.props as { variant: string; fullWidth: boolean };
    expect(props.variant).toBe(ButtonVariant.Outline);
    expect(props.fullWidth).toBe(true);
  });

  it('edits card title and background color', () => {
    seedSelected(BlockFactory.create(BlockType.Card));
    render(<BlockInspector />);
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Mi card' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar color Fondo' }));
    fireEvent.change(screen.getByLabelText('Hex Fondo'), { target: { value: '#000000' } });
    const props = selectedBlock()?.props as { title: string; backgroundColor: string };
    expect(props.title).toBe('Mi card');
    expect(props.backgroundColor).toBe('#000000');
  });
});
