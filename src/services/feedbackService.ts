import api from "../utils/api";

interface Feedback {
  id: number;
  name: string;
  email?: string;
  review: string;
  is_published: boolean;
  user_id?: number;
  created_at: string;
  updated_at: string;
}

interface FeedbackResponse {
  status: "success" | "error";
  message: string;
  data: {
    feedback?: Feedback[];
    pagination?: {
      page: number;
      per_page: number;
      total: number;
      pages: number;
    };
    id?: number;
    name?: string;
    email?: string;
    review?: string;
    is_published?: boolean;
    created_at?: string;
  };
}

export const feedbackService = {
  createFeedback: async (data: {
    name: string;
    email: string;
    review: string;
  }): Promise<FeedbackResponse> => {
    try {
      const response = await api.post("/feedback", data);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(
        err.response?.data?.message || "Failed to submit feedback"
      );
    }
  },

  getFeedback: async (
    page: number = 1,
    perPage: number = 10
  ): Promise<FeedbackResponse> => {
    try {
      const response = await api.get("/feedback/published", {
        params: { page, per_page: perPage },
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(
        err.response?.data?.message || "Failed to fetch feedback"
      );
    }
  },
};
