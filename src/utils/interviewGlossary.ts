import { interviewGlossaryTerms } from '../data/interviewGlossary';
import { createGlossary } from './glossaryEngine';

// The Interview Hub's hover-to-explain words. Answers have no topics, so the
// topic-related parts of the glossary are simply empty.
export const interviewGlossary = createGlossary(interviewGlossaryTerms, [], () => []);
