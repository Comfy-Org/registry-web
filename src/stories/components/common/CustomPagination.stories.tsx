import { CustomPagination } from '@/components/common/CustomPagination';
import { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

// Create a component with state for the Storybook
const PaginationWithState = ({ initialPage = 1, totalPages = 10 }) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  return (
    <CustomPagination 
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
    />
  );
};

const meta: Meta<typeof PaginationWithState> = {
  title: 'Components/Common/CustomPagination',
  component: PaginationWithState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PaginationWithState>;

export const Default: Story = {
  args: {
    initialPage: 1,
    totalPages: 10,
  },
};

export const ManyPages: Story = {
  args: {
    initialPage: 5,
    totalPages: 20,
  },
};

export const FewPages: Story = {
  args: {
    initialPage: 1,
    totalPages: 3,
  },
};
