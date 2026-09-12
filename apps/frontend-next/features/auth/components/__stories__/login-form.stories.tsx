import type { Meta, StoryObj } from '@storybook/react';
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/messages/ja.json';
import { LoginForm } from '../login-form';

const meta: Meta<typeof LoginForm> = {
  component: LoginForm,
  title: 'Auth/LoginForm',
  decorators: [
    (Story) => (
      <NextIntlClientProvider messages={messages} locale="ja">
        <div className="max-w-md mx-auto p-8">
          <Story />
        </div>
      </NextIntlClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LoginForm>;

export const Default: Story = {};
