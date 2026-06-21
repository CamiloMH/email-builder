import { Column, Row, Section, Text } from '@react-email/components';
import { BlockType } from '@email/core';
import { sectionStyle } from '../../theme/theme-style';
import type { BlockRenderStrategy } from '../block-render-strategy';

/** Renders two or three side-by-side text columns. */
export const columnsStrategy: BlockRenderStrategy<typeof BlockType.Columns> = {
  type: BlockType.Columns,
  render(block, theme) {
    const { columns } = block.props;
    return (
      <Section style={sectionStyle(theme)}>
        <Row>
          {columns.map((column) => (
            <Column
              key={column.id}
              style={{ verticalAlign: 'top', paddingLeft: 8, paddingRight: 8 }}
            >
              {column.heading ? (
                <Text style={{ color: theme.colors.text, fontWeight: 600, margin: 0 }}>
                  {column.heading}
                </Text>
              ) : null}
              <Text style={{ color: theme.colors.muted, marginTop: 4 }}>{column.text}</Text>
            </Column>
          ))}
        </Row>
      </Section>
    );
  },
};
