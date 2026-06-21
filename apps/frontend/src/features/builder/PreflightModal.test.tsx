import { BlockType, DEFAULT_THEME, createDefaultTemplate, type TemplateDocument } from '@email/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PreflightModal } from './PreflightModal';

const withImageMissingAlt: TemplateDocument = {
  name: 'Img',
  theme: DEFAULT_THEME,
  blocks: [
    { id: 'i1', type: BlockType.Image, props: { src: 'https://x/y.png', alt: '', widthPercent: 100 } },
  ],
};

describe('PreflightModal', () => {
  it('lists issues and confirms export anyway', () => {
    const onConfirm = vi.fn();
    render(
      <PreflightModal
        open
        document={withImageMissingAlt}
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />,
    );
    expect(screen.getByText(/Hay una imagen sin texto alternativo/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Exportar igual' }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('locates the offending block when an issue is clicked', () => {
    const onSelectBlock = vi.fn();
    const onClose = vi.fn();
    render(
      <PreflightModal
        open
        document={withImageMissingAlt}
        onClose={onClose}
        onSelectBlock={onSelectBlock}
      />,
    );
    fireEvent.click(
      screen.getByRole('button', { name: /Hay una imagen sin texto alternativo/ }),
    );
    expect(onSelectBlock).toHaveBeenCalledWith('i1');
    expect(onClose).toHaveBeenCalled();
  });

  it('shows a clean report for the default template', () => {
    render(
      <PreflightModal open document={createDefaultTemplate()} onClose={vi.fn()} onConfirm={vi.fn()} />,
    );
    expect(screen.getByText(/Sin problemas detectados/)).toBeInTheDocument();
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <PreflightModal
        open={false}
        document={createDefaultTemplate()}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
