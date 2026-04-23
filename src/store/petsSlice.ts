import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Pet } from '@definitions/index';

export interface PetsState {
  pets: Pet[];
  selectedPet: Pet | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PetsState = {
  pets: [],
  selectedPet: null,
  isLoading: false,
  error: null,
};

export const petsSlice = createSlice({
  name: 'pets',
  initialState,
  reducers: {
    fetchPetsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchPetsSuccess: (state, action: PayloadAction<Pet[]>) => {
      state.isLoading = false;
      state.pets = action.payload;
    },
    fetchPetsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    addPet: (state, action: PayloadAction<Pet>) => {
      state.pets.push(action.payload);
    },
    updatePet: (state, action: PayloadAction<Pet>) => {
      const index = state.pets.findIndex((pet) => pet.id === action.payload.id);
      if (index !== -1) {
        state.pets[index] = action.payload;
      }
    },
    deletePet: (state, action: PayloadAction<string>) => {
      state.pets = state.pets.filter((pet) => pet.id !== action.payload);
    },
    selectPet: (state, action: PayloadAction<Pet | null>) => {
      state.selectedPet = action.payload;
    },
    clearPets: (state) => {
      state.pets = [];
      state.selectedPet = null;
    },
  },
});

export const {
  fetchPetsStart,
  fetchPetsSuccess,
  fetchPetsFailure,
  addPet,
  updatePet,
  deletePet,
  selectPet,
  clearPets,
} = petsSlice.actions;

export default petsSlice.reducer;
