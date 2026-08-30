// features/content/store/ContentManagerSlice.ts

import { createSlice } from '@reduxjs/toolkit';
import type { FullContentDisplayDto, ContentSummaryDto } from '@/features/content/api/ContentManagerApi'; // ContentSummaryDto اضافه شد
import {
  createFullContent,
  createNewVersion,
  publishContent,
  getContentForDisplay,
  getLatestContents, // اضافه شد
} from './ContentManagerThunks';

interface ContentManagerState {
  displayContent: FullContentDisplayDto | null;
  latestContents: ContentSummaryDto[]; // === آرایه جدیدترین مقالات اضافه شد ===
  loading: boolean;
  latestLoading: boolean;
  actionLoading: boolean; 
  error: string | null;
}

const initialState: ContentManagerState = {
  displayContent: null,
  latestContents: [], // === مقدار اولیه اضافه شد ===
  loading: false,
  latestLoading: false,
  actionLoading: false,
  error: null,
};

const contentManagerSlice = createSlice({
  name: 'contentManager',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDisplayContent: (state) => {
      state.displayContent = null;
    },
  },
  extraReducers: (builder) => {
    // Get Content For Display
    builder
      .addCase(getContentForDisplay.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getContentForDisplay.fulfilled, (state, action) => {
        state.loading = false;
        state.displayContent = action.payload; 
      })
      .addCase(getContentForDisplay.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // === هندل کردن اکشن دریافت جدیدترین مقالات ===
    builder
      .addCase(getLatestContents.pending, (state) => {
        state.latestLoading = true;
        state.error = null;
      })
      .addCase(getLatestContents.fulfilled, (state, action) => {
        state.latestLoading = false;
        state.latestContents = action.payload; // دیتای دریافتی در استیت ذخیره می‌شود
      })
      .addCase(getLatestContents.rejected, (state, action) => {
        state.latestLoading = false;
        state.error = action.payload as string;
      });
    // ===============================================

    // Create Full Content
    builder
      .addCase(createFullContent.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createFullContent.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(createFullContent.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Create New Version
    builder
      .addCase(createNewVersion.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createNewVersion.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(createNewVersion.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Publish Content
    builder
      .addCase(publishContent.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(publishContent.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(publishContent.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearDisplayContent } = contentManagerSlice.actions;
export default contentManagerSlice.reducer;
