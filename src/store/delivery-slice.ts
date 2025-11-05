import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { DeliveryTask } from '../types/delivery'
import { DeliveryService } from '../services/delivery-service'

export const fetchTasks = createAsyncThunk('delivery/fetchTasks', async () => {
  return await DeliveryService.getTasks()
})

type DeliveryState = {
  tasks: DeliveryTask[]
  loading: boolean
  error?: string
}

const initialState: DeliveryState = {
  tasks: [],
  loading: false,
}

const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true
        state.error = undefined
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false
        state.tasks = action.payload
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

export const deliveryReducer = deliverySlice.reducer