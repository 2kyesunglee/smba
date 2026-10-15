export type TemplateType = 'SAFETY_RULES' | 'EDUCATION' | 'LOTO' | 'MSDS' | 'CHECKLIST';

export interface FormFieldDefinition {
  id: string;
  label: string;
  type: 'number' | 'text' | 'checkbox' | 'select';
  unit?: string;
  minThreshold?: number;
  maxThreshold?: number;
  options?: string[];
  required: boolean;
}

export interface TemplateProps {
  id: string;
  title: string;
  type: TemplateType;
  description: string;
  content: {
    instructions?: string[];
    fields?: FormFieldDefinition[];
    multilingualNotes?: Record<string, string>;
  };
  createdAt?: string;
}

export class Template {
  public readonly id: string;
  public title: string;
  public type: TemplateType;
  public description: string;
  public content: {
    instructions?: string[];
    fields?: FormFieldDefinition[];
    multilingualNotes?: Record<string, string>;
  };
  public readonly createdAt: string;

  constructor(props: TemplateProps) {
    this.id = props.id;
    this.title = props.title;
    this.type = props.type;
    this.description = props.description;
    this.content = props.content;
    this.createdAt = props.createdAt || new Date().toISOString();
  }
}
