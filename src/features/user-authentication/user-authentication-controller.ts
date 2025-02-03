import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export async function login(
  request: Request,
  response: Response,
  next: NextFunction,
) {}

export async function register(
  request: Request,
  response: Response,
  next: NextFunction,
) {}

export async function logout(
  request: Request,
  response: Response,
  next: NextFunction,
) {}
