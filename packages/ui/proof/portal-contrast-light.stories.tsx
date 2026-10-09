import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dialog, DialogTrigger, Modal, ModalOverlay } from 'react-aria-components';
import { Button } from '../src/Button';

// DELIBERATELY BROKEN, and only in the light theme, inside content that React
// Aria portals into <body>. Excluded from the workbench; only
// `npm run check:a11y` loads it (A11Y_PROOF=portal-contrast-light). It shows the
// gate checks portalled content in the theme under test: the same token pair as
// the contrast-light proof, ink-subtle on surface-inset, 4.44:1 in light.
const meta = { title: 'Proof/PortalLightContrast' } satisfies Meta;
export default meta;

export const SubtleInDialog: StoryObj<typeof meta> = {
  render: () => (
    <DialogTrigger defaultOpen>
      <Button>Open</Button>
      <ModalOverlay className="fixed inset-0 bg-scrim">
        <Modal>
          <Dialog aria-label="Proof dialog" className="bg-surface-raised p-4 text-ink outline-none">
            <p className="body bg-surface-inset p-2 text-ink-subtle">Subtle text on an inset surface</p>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  ),
};
