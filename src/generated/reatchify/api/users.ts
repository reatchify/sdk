// Generated API operations for users
// This file contains HTTP request functions for users endpoints

import { makeRequest } from '../client/http';

// Get all users
export async function users() {
  return makeRequest('GET', '/users');
}

// Get user by ID
export async function users__id({ id }: { id: string }) {
  return makeRequest('GET', '/users/{id}', { params: { id } });
}

