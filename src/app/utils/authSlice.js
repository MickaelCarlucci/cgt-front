import { createSlice } from "@reduxjs/toolkit";
import { firebaseAuth } from "../../../firebaseConfig";
import { signInWithEmailAndPassword, getIdToken, signOut } from "firebase/auth";

const initialState = {
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setUser, clearUser, setLoading, setError } = authSlice.actions;

// Action asynchrone pour la connexion utilisateur
export const loginUser = (email, password) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    // Authentification avec Firebase
    const userCredential = await signInWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    );
    const token = await getIdToken(userCredential.user);

    // Appel au backend avec le token pour obtenir les informations utilisateur
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/signin`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    dispatch(setUser(data.user)); // Mettre à jour le store avec les informations utilisateur
    console.log("Utilisateur reçu du backend :", data.user);
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    dispatch(setError("Erreur lors de la connexion"));
  } finally {
    dispatch(setLoading(false));
  }
};

// Action asynchrone pour la déconnexion utilisateur
export const logoutUser = () => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    await signOut(firebaseAuth);
    dispatch(clearUser());
  } catch (error) {
    console.error("Erreur lors de la déconnexion :", error);
    dispatch(setError("Erreur lors de la déconnexion"));
  } finally {
    dispatch(setLoading(false));
  }
};

export default authSlice.reducer;
