// @flow

import React, { Component } from 'react';

import { withFormik, Form } from 'formik';
import * as Yup from 'yup';

import ProductSale from '../../components/common/product-sale-component';
import SaleConfirmation from '../../components/common/sale-confirmation';
import ActionFormButton from '../../components/common/ActionFormButton';
import { Section, Wrapper } from '../../components/common/FormUtils';

import BudgetExtraComponent from './components/BudgetExtraComponent';
import { BUDGET_STATUS } from './components/BudgetStatus';

type Props = {
  onChageFormToEditMode: Function,
  setFieldValue: Function,
  handleSubmit: Function,
  onRemoveItem: Function,
  isSubmitting: boolean,
  stock: Array<Object>,
  values: Object,
  errors: Object,
  mode: string,
};

type State = {
  isSaleConfirmationDialogOpen: boolean,
};

class BudgetForm extends Component<Props, State> {
  state = {
    isSaleConfirmationDialogOpen: false,
  };

  onToggleSaleConfirmationDialog = (): void => {
    const { isSaleConfirmationDialogOpen } = this.state;

    this.setState({
      isSaleConfirmationDialogOpen: !isSaleConfirmationDialogOpen,
    });
  };

  renderProductSale = (): Object => {
    const {
      setFieldValue,
      values,
      errors,
      stock,
      mode,
    } = this.props;

    const formMode = (values.status === BUDGET_STATUS.APPROVED ? 'detail' : mode);

    return (
      <Section>
        <ProductSale
          setFieldValue={setFieldValue}
          ExtraComponent={() => (
            <BudgetExtraComponent
              onToggleSaleConfirmationDialog={this.onToggleSaleConfirmationDialog}
              {...this.props}
            />)}
          withExtraComponent
          mode={formMode}
          values={values}
          errors={errors}
          stock={stock}
        />
      </Section>
    );
  };

  renderSaleConfirmation = (): Object => {
    const { isSaleConfirmationDialogOpen } = this.state;
    const { values } = this.props;

    return (
      <SaleConfirmation
        onCloseDialog={this.onToggleSaleConfirmationDialog}
        isOpen={isSaleConfirmationDialogOpen}
        {...this.props}
        {...values}
      />
    );
  };

  renderActionFormButton = (): Object => {
    const {
      onChageFormToEditMode,
      onRemoveItem,
      handleSubmit,
      isSubmitting,
      mode,
    } = this.props;

    return (
      <ActionFormButton
        onChageFormToEditMode={onChageFormToEditMode}
        onRemoveItem={onRemoveItem}
        onClick={handleSubmit}
        disabled={isSubmitting}
        mode={mode}
      />
    );
  };

  render() {
    const { values } = this.props;

    const shouldShowActionFormButton = (values.status !== BUDGET_STATUS.APPROVED);

    return (
      <Wrapper>
        <Form
          {...this.staet}
        >
          {this.renderProductSale()}
          {shouldShowActionFormButton && this.renderActionFormButton()}
          {this.renderSaleConfirmation()}
        </Form>
      </Wrapper>
    );
  }
}

const CustomForm = withFormik({
  mapPropsToValues: ({ item }) => ({
    paymentInfo: item.paymentInfo || {
      lastInputFocused: '',
      creditCardValue: '',
      debitCardValue: '',
      checkValue: '',
      moneyValue: '',
    },
    observation: item.observation || '',
    discount: item.discount || {},
    products: item.products || [],
    customer: item.customer || '',
    validity: item.validity || '',
    status: item.status || BUDGET_STATUS.PENDING,
    isInDebit: item.isInDebit || false,
    subtotal: item.subtotal || 0,
    total: item.total || 0,
    code: item.code || '',
    id: item.id || null,
  }),

  validationSchema: _props => Yup.lazy(() => Yup.object().shape({
    products: Yup.array()
      .required('Ao menos um Produto deve ser Adicionado'),

    customer: Yup.string()
      .required('O Cliente é obrigatório'),

    validity: Yup.string()
      .required('A Validade é obrigatória'),
  })),

  handleSubmit(values, { setSubmitting, props }) {
    const {
      onToggleFullScreenDialog,
      onConfirmBudgetPayment,
      onCreateItem,
      onEditItem,
      mode,
    } = props;

    if (mode === 'create') {
      onCreateItem(values);
    }

    if (mode === 'edit') {
      onEditItem(values);
    }

    if (mode === 'detail') {
      onConfirmBudgetPayment({
        ...values,
        status: BUDGET_STATUS.APPROVED,
      });

      onToggleFullScreenDialog();
    }

    setSubmitting(false);
  },
})(BudgetForm);

export default CustomForm;
