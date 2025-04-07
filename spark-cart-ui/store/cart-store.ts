import { create } from "zustand"

interface Vote {
  itemId: string
  type: "up" | "down"
}

interface CartState {
  votes: Record<string, Vote>
  addVote: (itemId: string, type: "up" | "down") => void
  removeVote: (itemId: string) => void
  hasVoted: (itemId: string) => boolean
  getVoteType: (itemId: string) => "up" | "down" | null
}

export const useCartStore = create<CartState>((set, get) => ({
  votes: {},

  addVote: (itemId, type) => {
    set((state) => ({
      votes: {
        ...state.votes,
        [itemId]: { itemId, type },
      },
    }))
  },

  removeVote: (itemId) => {
    set((state) => {
      const newVotes = { ...state.votes }
      delete newVotes[itemId]
      return { votes: newVotes }
    })
  },

  hasVoted: (itemId) => {
    return !!get().votes[itemId]
  },

  getVoteType: (itemId) => {
    const vote = get().votes[itemId]
    return vote ? vote.type : null
  },
}))

