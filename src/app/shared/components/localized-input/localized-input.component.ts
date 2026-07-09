import { Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { LocalizedText } from '../../../core/models/localized-text.model';

@Component({
  selector: 'app-localized-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LocalizedInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="localized-input">
      @if (label()) {
        <label class="field-label">{{ label() }}</label>
      }
      <div class="lang-fields">
        <div class="lang-field">
          <span class="lang-tag">FA</span>
          @if (multiline()) {
            <textarea
              [placeholder]="placeholderFa()"
              [value]="value.fa"
              (input)="onFaChange($event)"
              rows="3"
            ></textarea>
          } @else {
            <input
              type="text"
              [placeholder]="placeholderFa()"
              [value]="value.fa"
              (input)="onFaChange($event)"
            />
          }
        </div>
        <div class="lang-field">
          <span class="lang-tag">EN</span>
          @if (multiline()) {
            <textarea
              [placeholder]="placeholderEn()"
              [value]="value.en"
              (input)="onEnChange($event)"
              rows="3"
            ></textarea>
          } @else {
            <input
              type="text"
              [placeholder]="placeholderEn()"
              [value]="value.en"
              (input)="onEnChange($event)"
            />
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    .field-label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .lang-fields {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .lang-field {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .lang-tag {
      flex-shrink: 0;
      width: 2rem;
      height: 2.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface-muted);
      border-radius: var(--radius-sm);
      font-size: 0.6875rem;
      font-weight: 700;
      color: var(--text-muted);
    }

    input,
    textarea {
      flex: 1;
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      font-family: inherit;
      font-size: 0.875rem;
      background: var(--surface);
      color: var(--text-primary);
      transition: border-color 0.15s;

      &:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 15%, transparent);
      }
    }

    textarea {
      resize: vertical;
      min-height: 4rem;
    }
  `,
})
export class LocalizedInputComponent implements ControlValueAccessor {
  readonly label = input<string>();
  readonly multiline = input(false);
  readonly placeholderFa = input('عنوان فارسی');
  readonly placeholderEn = input('English title');

  value: LocalizedText = { fa: '', en: '' };

  private onChange: (value: LocalizedText) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: LocalizedText | null): void {
    this.value = value ?? { fa: '', en: '' };
  }

  registerOnChange(fn: (value: LocalizedText) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onFaChange(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.updateValue({ ...this.value, fa: target.value });
  }

  onEnChange(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.updateValue({ ...this.value, en: target.value });
  }

  private updateValue(value: LocalizedText): void {
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }
}
