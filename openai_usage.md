# OpenAI Usage in BrandFactory

## Overview

BrandFactory leverages OpenAI's latest models to create a comprehensive AI-powered creative asset generation platform. The application uses GPT-5.2, GPT-Image-1.5, and Sora-2 to transform brand images into professional marketing assets with intelligent analysis and strategy recommendations.

## Models & Implementation

### 1. GPT-5.2 with Reasoning (Core Intelligence)

**Image Analysis & Brand Context Extraction**
- Uses vision capabilities with structured outputs via the `responses.create` API
- Analyzes uploaded brand images to extract colors, mood, subject matter, logo presence, and industry
- Identifies key attributes like person descriptions, brand names, and visual elements
- Implements strict schema validation for reliable, structured data extraction

**Prompt Generation**
- Leverages reasoning capabilities (`reasoning: { effort: "high" }`) to create photographer-quality prompts
- Generates diverse, narrative-driven prompts that preserve brand identity
- Follows professional creative direction principles with specific camera angles, composition, and lighting
- Creates tailored prompts for multiple formats: social posts, portraits, square, landscape, videos, and carousel posts

**Ad Copy Generation**
- Produces platform-specific headlines, body text, and CTAs
- Adapts tone and style based on brand context and target platforms
- Generates cohesive messaging aligned with brand identity

**Engagement Analysis**
- Predicts social media performance with 0-100 scoring
- Recommends optimal platforms (Instagram, LinkedIn, Twitter/X, TikTok, Facebook)
- Provides actionable insights on strengths, improvements, and optimization strategies

**Brand Strategy Development**
- Creates comprehensive brand strategies including target audience profiling (demographics, psychographics, interests, pain points, aspirations)
- Identifies brand archetypes and positioning statements
- Generates messaging pillars, content themes, and platform-specific sample posts with captions, hooks, hashtags, and optimal posting times

### 2. GPT-Image-1.5 (Visual Generation)

- Primary image generation engine for all asset types
- Supports multiple aspect ratios (1:1, 3:4, 16:9, 9:16)
- Implements reference image editing with `input_fidelity: "high"` for brand consistency
- Generates high-quality, prompt-faithful images with brand identity preservation

### 3. Sora-2 (Video Generation)

- Creates dynamic video assets from static brand images
- Uses image-to-video with customizable duration (default 8 seconds)
- Maintains brand visual consistency across motion content

## Technical Implementation

- **API**: OpenAI Node.js SDK v6.17+ with `responses.create` for reasoning and structured outputs
- **Architecture**: Next.js 16 with TypeScript, modular service layer for each AI capability
- **Optimization**: Parallel API calls, intelligent error handling, and structured data validation

