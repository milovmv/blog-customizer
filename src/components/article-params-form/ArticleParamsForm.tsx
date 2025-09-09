import { useState, useRef, useEffect, FormEvent } from 'react';
import { ArrowButton } from 'src/ui/arrow-button';
import { Button } from 'src/ui/button';
import { Select } from 'src/ui/select';
import { RadioGroup } from 'src/ui/radio-group';
import { Separator } from 'src/ui/separator';
import { Text } from 'src/ui/text';
import {
  fontFamilyOptions,
  fontColors,
  backgroundColors,
  contentWidthArr,
  fontSizeOptions,
  defaultArticleState,
  OptionType,
  ArticleStateType
} from 'src/constants/articleProps';

import { clsx } from 'clsx';
import styles from './ArticleParamsForm.module.scss';

interface ArticleParamsFormProps {
  onApply: (settings: ArticleStateType) => void;
  onReset: () => void;
}

// Создаем специальные OptionType объекты для RadioGroup
// где value === title, чтобы обойти баг в компоненте Option
const contentWidthOptions: OptionType[] = [
  {
    value: 'Широкий', // value должно быть равно title
    title: 'Широкий',
    className: 'width-wide',
    optionClassName: 'option-wide'
  },
  {
    value: 'Узкий', // value должно быть равно title
    title: 'Узкий',
    className: 'width-narrow',
    optionClassName: 'option-narrow'
  },
];

const fontSizeRadioOptions: OptionType[] = [
  { value: '18px', title: '18px', className: 'font-size-18' },
  { value: '25px', title: '25px', className: 'font-size-25' },
  { value: '38px', title: '38px', className: 'font-size-38' },
];

// Функции для преобразования между разными форматами OptionType
const convertToRadioOption = (option: OptionType, radioOptions: OptionType[]): OptionType => {
  return radioOptions.find(radioOption => radioOption.title === option.title) || radioOptions[0];
};

const convertFromRadioOption = (radioOption: OptionType, originalOptions: OptionType[]): OptionType => {
  return originalOptions.find(option => option.title === radioOption.title) || originalOptions[0];
};

export const ArticleParamsForm = ({ onApply, onReset }: ArticleParamsFormProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formState, setFormState] = useState<ArticleStateType>(defaultArticleState);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Конвертируем текущие значения для RadioGroup
  const currentContentWidthOption = convertToRadioOption(formState.contentWidth, contentWidthOptions);
  const currentFontSizeOption = convertToRadioOption(formState.fontSizeOption, fontSizeRadioOptions);

  // Обработчик открытия/закрытия сайдбара
  const handleToggleSidebar = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Закрытие сайдбара при клике вне его области
  useEffect(() => {
	const handleClickOutside = (event: MouseEvent) => {
	  // Ранний возврат если меню закрыто - не выполняем лишние проверки
	  if (!isMenuOpen) return;

	  if (sidebarRef.current &&
		  !sidebarRef.current.contains(event.target as Node) &&
		  !(event.target as Element).closest(`.${styles.arrowButtonContainer}`)) {
		setIsMenuOpen(false);
	  }
	};

	document.addEventListener('mousedown', handleClickOutside);
	return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Обработчик изменения настроек для Select
  const handleSelectChange = (key: keyof ArticleStateType) => (option: OptionType) => {
    setFormState(prev => ({
      ...prev,
      [key]: option
    }));
  };

  // Обработчик изменения ширины контента
  const handleContentWidthChange = (radioOption: OptionType) => {
    const originalOption = convertFromRadioOption(radioOption, contentWidthArr);
    setFormState(prev => ({
      ...prev,
      contentWidth: originalOption
    }));
  };

  // Обработчик изменения размера шрифта
  const handleFontSizeChange = (radioOption: OptionType) => {
    const originalOption = convertFromRadioOption(radioOption, fontSizeOptions);
    setFormState(prev => ({
      ...prev,
      fontSizeOption: originalOption
    }));
  };

  // Обработчик отправки формы
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onApply(formState);
  };

  // Обработчик сброса настроек
  const handleReset = () => {
    setFormState(defaultArticleState);
    onReset();
  };

  return (
    <>
      <div className={styles.arrowButtonContainer}>
        <ArrowButton isOpen={isMenuOpen} onClick={handleToggleSidebar} />
      </div>

      <aside
        ref={sidebarRef}
        className={clsx(styles.container, isMenuOpen && styles.container_open)}
      >
        <form className={styles.form} onSubmit={handleSubmit}>
		  <div className={styles.section}>
            <Text weight={800} size={31}>
              ЗАДАЙТЕ ПАРАМЕТРЫ
            </Text>
          </div>

		  <div className={styles.section}>
            <Text weight={800} size={12}>
              ШРИФТ
            </Text>
            <Select
              selected={formState.fontFamilyOption}
              options={fontFamilyOptions}
              onChange={handleSelectChange('fontFamilyOption')}
              placeholder="Выберите шрифт"
            />
          </div>

          <div className={styles.section}>
            <Text weight={800} size={12}>
              РАЗМЕР ШРИФТА
            </Text>
            <RadioGroup
              name="fontSize"
              selected={currentFontSizeOption}
              options={fontSizeRadioOptions}
              onChange={handleFontSizeChange}
              title=""
            />
          </div>

          <div className={styles.section}>
            <Text weight={800} size={12}>
              ЦВЕТ ШРИФТА
            </Text>
            <Select
              selected={formState.fontColor}
              options={fontColors}
              onChange={handleSelectChange('fontColor')}
              placeholder="Выберите цвет шрифта"
            />
          </div>

          <div style={{ marginBottom: '50px' }}>
  			<Separator />
		  </div>

          <div className={styles.section}>
            <Text weight={800} size={12}>
              ЦВЕТ ФОНА
            </Text>
            <Select
              selected={formState.backgroundColor}
              options={backgroundColors}
              onChange={handleSelectChange('backgroundColor')}
              placeholder="Выберите цвет фона"
            />
          </div>

          <div className={styles.section}>
            <Text weight={800} size={12}>
              ШИРИНА КОНТЕНТА
            </Text>
            <Select
              selected={formState.contentWidth}
              options={contentWidthArr}
              onChange={handleSelectChange('contentWidth')}
              placeholder="Выберите ширину контента"
            />
          </div>

          <div className={styles.bottomContainer}>
            <Button
              title='Сбросить'
              htmlType='button'
              type='clear'
              onClick={handleReset}
            />
            <Button
              title='Применить'
              htmlType='submit'
              type='apply'
            />
          </div>
        </form>
      </aside>
    </>
  );
};