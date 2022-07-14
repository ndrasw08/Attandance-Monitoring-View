/* eslint-disable no-mixed-operators */
/* eslint-disable no-plusplus */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-loop-func */
/* eslint-disable no-redeclare */
/* eslint-disable react/no-unused-state */
/* eslint-disable no-const-assign */
/* eslint-disable max-len */
/* eslint-disable no-alert */
/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-multi-assign */
/* eslint-disable react/sort-comp */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable no-undef */
/* eslint-disable camelcase */
/* eslint-disable quote-props */
/* eslint-disable camelcase */
/* eslint-disable no-lonely-if */
/* eslint-disable no-return-assign */
/* eslint-disable arrow-parens */
/* eslint-disable react/no-did-mount-set-state */
import React, { PureComponent } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import ls from 'local-storage';
import axios from 'axios';
import ViewListTable from '../../../shared/components/table/viewListTable';
import { Field, reduxForm } from 'redux-form';
import Swal from 'sweetalert2';
import showNotifications from '../../Preferences/notificationMessages';
import { Button, Card, CardBody, Col, Container, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import renderTextInput from '../../../shared/components/form/TextInput';
import parse from 'html-react-parser';
import CalendarBlankIcon from 'mdi-react/CalendarBlankIcon';
import renderMultiSelectField from '../../../shared/components/form/MultiSelect';
import renderSelectField from '../../../shared/components/form/Select';
import renderDatePickerField from '../../../shared/components/form/DatePicker';
import renderTimePickerIntervalField from '../../../shared/components/form/TimePickerInterval';
import moment from 'moment';
import utils from '../../../utils';

class AttendanceMonitoring extends PureComponent {
  static propTypes = {
    t: PropTypes.func.isRequired,
    men_id: PropTypes.func.isRequired,
    fga_id: PropTypes.func.isRequired,
    destroy: PropTypes.func.isRequired,
    initialize: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    pristine: PropTypes.func.isRequired,
    conds: PropTypes.string.isRequired,
  };
  constructor(props) {
    super(props);
    const { t } = props;
    this.userHeads = [
      { '0': t('LBL.NUMBER') },
      { '1': t('LBL.NAME') },
      { '2': t('LBL.DATE_IN') },
      { '3': t('LBL.TIME_IN') },
      { '4': t('LBL.TIME_OUT') },
      { '5': t('LBL.FUNCTION') },
    ];
    this.adminHeads = [
      { '0': t('LBL.NUMBER') },
      { '1': t('LBL.NAME') },
      { '2': t('LBL.DATE_IN') },
      { '3': t('LBL.TIME_IN') },
      { '4': t('LBL.TIME_OUT') },
      { '5': t('LBL.FUNCTION') },
    ];
    this.state = {
      token: '',
      apiws: '',
      idUser: '',
      userDataWidth: ['5%', '15%', '20%', '10%', '25%', '25%'],
      adminDataWidth: ['5%', '15%', '20%', '10%', '15%', '20%', '15%'],
      isAdmin: false,
      reason: '',
      action: null,
      approvalData: {},
      editcond: '',
      deletecond: '',
      statusEdit: false,
      arrEmp: [],
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.getUserLevel = this.getUserLevel.bind(this);
    this.getTableData = this.getTableData.bind(this);
    this.toggle = this.toggle.bind(this);
    this.getButton = this.getButton.bind(this);
    this.editAttMonitoring = this.editAttMonitoring.bind(this);
    this.deleteAttMonitoring = this.deleteAttMonitoring.bind(this);
    this.getEmployee = this.getEmployee.bind(this);
  }

  // componentWillMount() {
  //   this.setState({
  //     token: ls.get('token'),
  //     apiws: ls.get('ws_ip'),
  //     idUser: ls.get('user_cred').usr_id,
  //     emp_id: ls.get('user_cred').emp_id,
  //     men_id: ls.get('men_id'),
  //     fga_id: ls.get('fga_id'),
  //     urlData: `${ls.get('ws_ip')}/attmanual/getAllItem/`,
  //   }, () => {
  //     this.getUserLevel();
  //     this.getTableData();
  //     this.getButton();
  //     this.getEmployee();
  //   });
  //   this.props.destroy();
  // }

  componentDidMount = () => {
    this.setState({
      token: ls.get('token'),
      apiws: ls.get('ws_ip'),
      idUser: ls.get('user_cred').usr_id,
      emp_id: ls.get('user_cred').emp_id,
      men_id: ls.get('men_id'),
      fga_id: ls.get('fga_id'),
      urlData: `${ls.get('ws_ip')}/attmanual/getAllItem`,
    }, () => {
      this.getUserLevel();
      this.getTableData();
      this.getButton();
      this.getEmployee();
    });
    this.props.destroy();
  }

  componentWillReceiveProps(newProps) {
    const { t } = newProps;
    this.userHeads = [
      { '0': t('LBL.NUMBER') },
      { '1': t('LBL.NAME') },
      { '2': t('LBL.DATE_IN') },
      { '3': t('LBL.TIME_IN') },
      { '4': t('LBL.TIME_OUT') },
      { '5': t('LBL.FUNCTION') },
    ];
    this.adminHeads = [
      { '0': t('LBL.NUMBER') },
      { '1': t('LBL.NAME') },
      { '2': t('LBL.DATE_IN') },
      { '3': t('LBL.TIME_IN') },
      { '4': t('LBL.TIME_OUT') },
      { '5': t('LBL.FUNCTION') },
    ];
  }

  getUserLevel() {
    const { token, apiws, idUser } = this.state;
    const config = {
      headers: {
        Authorization: `bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    axios.post(
      `${apiws}/appuser/getAllItemById/${idUser}`,
      '',
      config,
    ).then((response) => {
      if (response.data.status === 'ok') {
        if (response.data.data[0].is_all_emp_access === '0' || response.data.data[0].is_all_emp_access === 0) {
          this.setState({ isAdmin: true });
          this.getTableData();
        }
      }
    }).catch((error) => {
      // showNotifications('Fail', 'Delete Failed', 'danger');
    });
  }

  getTableData() {
    this.child.reload();
  }

  // toggle = () => {
  //   this.props.destroy();
  //   this.setState({ modal: !this.state.modal, reason: '' });
  // }

  toggle(x) {
    if (x === 'add' || x === 'cancel') {
      this.setState({ statusEdit: false });
      this.setState({ modal: !this.state.modal });
      const datamaping = {
        attendance_status: '',
        emp_id: '',
        date_in: '',
        time_in: '',
        date_out: '',
        time_out: '',
        description: '',
      };
      this.props.initialize(datamaping);
    }
  }

  getButton() {
    const men = this.state.men_id;
    const fga = this.state.fga_id;
    const config = {
      headers: {
        Authorization: `Bearer ${ls.get('token')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    const data = {
      fga_id: fga,
      men_id: men,
    };
    const formBody = Object.keys(data).map(key =>
      `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`).join('&');
    axios.post(
      `${ls.get('ws_ip')}/appfunctionaccess/getAllReference`,
      formBody,
      config,
    ).then((res) => {
      if (res.data.status === 'ok') {
        const resmen = res.data.data;
        const array = [];
        if (resmen.length > 0) {
          resmen.map(obj => (
            array.push(obj)
          ));
        }
        // eslint-disable-next-line array-callback-return
        array.map((dt) => {
          if (dt.fua_read_priv === '1') {
            this.setState({ addcond: dt.fua_add });
            this.setState({ editcond: dt.fua_edit });
            this.setState({ deletecond: dt.fua_delete });
          }
        });
      }
    }).catch(() => {
      // console.log(error);
    });
  }

  getEmployee() {
    const config = {
      headers: { 'Authorization': `Bearer ${ls.get('token')}` },
    };
    axios.post(
      `${ls.get('ws_ip')}/employee/getAllAsc`,
      '',
      config,
    ).then((resemp) => {
      const emp = resemp.data.data;
      const array = [];
      if (emp.length === 0) {
        this.setState({ arrEmp: array });
      } else {
        emp.map(obj => (
          array.push({ value: obj.emp_id, label: obj.emp_name })
        ));
        this.setState({ arrEmp: array });
      }
    }).catch(() => {
      // console.log(error);
    });
  }

  handleSubmit(values) {
    const userid = ls.get('user_cred').usr_id;
    const { token, apiws } = this.state;
    const error = true;
    const id = values.atm_id;
    let url;
    let data;
    console.log(values);
    const date = typeof values.date_in === 'undefined' || values.date_in === null ? null : moment(values.date_in).format('YYYY-MM-DD');
    const att_time_in = values.time_in === null || values.time_in === '' ? '' : moment(values.time_in).format('HH:mm');
    const att_time_out = values.time_out === null || values.time_out === '' ? '' : moment(values.time_out).format('HH:mm');
    const emp_id = typeof values.emp_id === 'object' ? values.emp_id.value : values.emp_id;
    const desc = values.description;
    if (id === undefined || id === '') {
      url = `${apiws}/attmanual/saveItem`;
      data = {
        desc,
        att_time_in,
        att_time_out,
        date,
        emp_id,
        cuser_id: userid,
      };
    } else {
      url = `${apiws}/attmanual/updateItem/${id}`;
      data = {
        desc,
        att_time_in,
        att_time_out,
        date,
        emp_id,
        muser_id: userid,
      };
    }
    // data = {
    //   data: JSON.stringify(data),
    // };
    const formBody = Object.keys(data).map(key =>
      `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`).join('&');
    const config = {
      headers: {
        'Authorization': `bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    if (error) {
      axios.post(
        url,
        formBody,
        config,
      ).then((response) => {
        if (response.data.status === 'ok') {
          showNotifications('Success', 'Save Success', 'success');
          this.props.destroy();
          this.setState({ modal: false });
          this.getTableData();
        } else {
          showNotifications('Fail', response.data.status, 'danger');
        }
      }).catch(() => {
        showNotifications('Fail', 'Save Failed', 'danger');
      });
    }
  }

  async editAttMonitoring(id) {
    const { token, apiws } = this.state;
    const config = {
      headers: {
        'Authorization': `bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    await axios.post(
      `${ls.get('ws_ip')}/attmanual/getAllItemByAtmId/${id}`,
      '',
      config,
    ).then(async (response) => {
      if (response.data.status === 'ok') {
        const getResponseData = response.data.data;
        const datamaping = {
          atm_id: getResponseData[0].atm_id,
          emp_id: getResponseData[0].emp_id,
          attendance_status: getResponseData[0].atm_type,
          date_in: getResponseData[0].atm_in !== null ? moment(getResponseData[0].atm_in) : moment(getResponseData[0].atm_out),
          time_in: getResponseData[0].atm_in !== null ? moment(getResponseData[0].atm_in) : '',
          time_out: getResponseData[0].atm_out !== null ? moment(getResponseData[0].atm_out) : '',
          description: getResponseData[0].atm_description,
        };
        this.setState({ statusEdit: true });
        this.setState({ modal: true }, () => {
          this.props.destroy();
          this.props.initialize(datamaping);
        });
      } else {
        showNotifications('Fail', 'Save Failed', 'danger');
      }
    }).catch(() => {
      // console.log(error);
    });
  }

  detailRows(id) {
    this.setState({
      redirectUrl: true,
      detailId: id,
    });
  }

  deleteAttMonitoring(id) {
    const { token, apiws } = this.state;
    const userid = ls.get('user_cred').usr_id;
    const config = {
      headers: {
        Authorization: `bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    Swal.fire({
      title: 'Are you sure?',
      text: 'You will delete this item !',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff4861',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      reverseButtons: true,
    }).then((result) => {
      if (result.value) {
        axios.post(
          `${ls.get('ws_ip')}/attmanual/deleteItem/${id}`,
          `duser_id=${userid}`,
          config,
        ).then((response) => {
          if (response.data.status === 'ok') {
            showNotifications('Success', 'Delete Success', 'success');
            setTimeout(() => {
              this.child.reload('delete');
            }, 2000);
          } else {
            showNotifications('Fail', 'Delete Failed', 'danger');
          }
        }).catch(() => {
          showNotifications('Fail', 'Delete Failed', 'danger');
        });
      }
    });
  }

  render() {
    const { t, handleSubmit, pristine } = this.props;
    const {
      urlData, isAdmin, emp_id, addcond, editcond,
      deletecond, statusEdit, arrEmp,
    } = this.state;
    let button_action;
    const addBtn = (
      <Button
        color="primary"
        className="btn_table_navbar"
        onClick={() => this.toggle('add')}
        style={{ float: 'right', 'margin-bottom': '20px', display: addcond === '1' ? '' : 'none' }}
      >
        {t('FRM.ADD')} {t('LBL.ATTENDANCE')}
      </Button >
    );
    const modalStyle = {
      maxWidth: '800px',
      textAlign: 'center',
    };
    if (statusEdit) {
      button_action = (
        <Button
          color="success"
          type="submit"
          form="addattmonitoring"
          disabled={pristine}
        > {t('FRM.EDIT')}
        </Button>);
    } else {
      button_action = (
        <Button
          color="primary"
          form="addattmonitoring"
          type="submit"
          disabled={pristine}
        >{t('FRM.SAVE')}
        </Button>);
    }
    return (
      <Container>
        <Row className="m0" style={{ padding: '0px' }}>
          <Col md={12} style={{ padding: '0px' }}>
            <div className="header-page-panel mt-0">
              {/* <img className="header-icon" src={HeaderIcon} alt="attendance" /> */}
              <h3 className="page-title">{t('LBL.ATTENDANCE')}</h3>
              <h3 className="page-subhead subhead">{t('LBL.ATT_MANUAL_REQUEST')}</h3>
            </div>
          </Col>
        </Row>
        <Row>
          <Col md={12} xs={12} lg={12} xl={12}>
            <Card>
              <CardBody style={{ 'padding': '20px 5px 30px 10px' }}>
                {
                  isAdmin === true ?
                    <ViewListTable
                      url={`${urlData}`}
                      heads={this.adminHeads}
                      addBtn={addBtn}
                      // buttonAction={['approve', 'reject']}
                      primaryKey="atm_id"
                      widthTable={this.state.adminDataWidth}
                      updateFunc={this.editAttMonitoring}
                      deleteFunc={this.deleteAttMonitoring}
                      detailFunc={this.detailRows}
                      onRef={ref => (this.child = ref)}
                      editCond={editcond}
                      deleteCond={deletecond}
                      conds={this.props.conds}
                      EmpFilter
                      PeriodStart
                      PeriodEnd
                      AttandanceManualFilter
                    />
                    :
                    <ViewListTable
                      url={`${urlData}/${emp_id}`}
                      heads={this.userHeads}
                      // buttonAction={[]}
                      primaryKey="atm_id"
                      widthTable={this.state.userDataWidth}
                      updateFunc={this.editAttMonitoring}
                      deleteFunc={this.deleteAttMonitoring}
                      detailFunc={this.detailRows}
                      onRef={ref => (this.child = ref)}
                      editCond={editcond}
                      deleteCond={deletecond}
                      conds={this.props.conds}
                      EmpFilter
                      PeriodStart
                      PeriodEnd
                      AttandanceManualFilter
                    />
                }
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Modal
          isOpen={this.state.modal}
          toggle={this.toggle}
          className="modal-dialog modal-input"
          style={{ maxWidth: '800px', marginTop: '30px', textAlign: 'center' }}
        >
          <ModalHeader toggle={this.toggle}>{t('FRM.ADD')} {t('LBL.ATTENDANCE')}</ModalHeader>
          <ModalBody>
            <form
              className="form form--horizontal"
              onSubmit={handleSubmit(this.handleSubmit)}
              name="addattmonitoring"
              id="addattmonitoring"
            >
              <Container>
                <Row>
                  <Col md="12" lg="12" xl="12" sm="12">
                    <input type="hidden" name="atm_id" />
                    <div className="form__form-group">
                      <span className="form__form-group-label">{t('LBL.NAME')}</span>
                      <div className="form__form-group-field">
                        <Field
                          name="emp_id"
                          component={renderSelectField}
                          options={arrEmp}
                        />
                      </div>
                    </div>
                  </Col>
                </Row>
                {/* <Row>
                      <Col md="12" lg="12" xl="12" sm="12">
                        <div className="form__form-group">
                          <span className="form__form-group-label">{t('LBL.ATTENDANCE_STATUS')}</span>
                          <div className="form__form-group-field">

                            <Field
                              name="attendance_status"
                              component={renderSelectField}
                              options={[
                                { value: '1', label: 'Late In' },
                                { value: '2', label: 'Ontime' },
                              ]}
                            />
                          </div>
                        </div>
                      </Col>
                    </Row> */}
                <Row>
                  <Col md="12" lg="12" xl="12" sm="12">
                    <div className="form__form-group">
                      <span className="form__form-group-label">{t('LBL.DATE')}</span>
                      <div className="form__form-group-field">
                        <Row className="w-100">
                          <Col md={8} sm={12}>
                            <div className="form__form-group-field form-group-ml-pl-0 w-100">
                              <Field
                                name="date_in"
                                component={renderDatePickerField}
                              />
                              <div className="form__form-group-icon">
                                <CalendarBlankIcon />
                              </div>
                            </div>
                          </Col>

                        </Row>
                      </div>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="12" lg="12" xl="12" sm="12">
                    <div className="form__form-group">
                      <span className="form__form-group-label">{t('LBL.TIME')}</span>
                      <div className="form__form-group-field">
                        <Row className="w-100">
                          <Col md={4} sm={12}>
                            <div className="timepicker_sync">
                              <Field
                                name="time_in"
                                component={renderTimePickerIntervalField}
                                placeholder="hh:mm"
                                formatdate="HH:mm"
                              />
                            </div>
                          </Col>
                          <Col md={4} sm={12}>
                            <div className="timepicker_sync">
                              <Field
                                name="time_out"
                                component={renderTimePickerIntervalField}
                                placeholder="hh:mm"
                                formatdate="HH:mm"
                              />
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="12" lg="12" xl="12" sm="12">
                    <div className="form__form-group">
                      <span className="form__form-group-label">{t('LBL.DESCRIPTION')}</span>
                      <div className="form__form-group-field">
                        <Field
                          name="description"
                          component={renderTextInput}
                          type="text"
                        />
                      </div>
                    </div>
                  </Col>
                </Row>
              </Container>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => { this.toggle('cancel'); }}>{t('FRM.CANCEL')}</Button>
            {button_action}
          </ModalFooter>
        </Modal>
      </Container>
    );
  }
}

const validate = (values) => {
  // const errors = {};
  // if (!values.date_in) {
  //   errors.date_in = 'Date in field shouldn’t be empty';
  // }
  // if (!values.date_out) {
  //   errors.date_out = 'Date out field shouldn’t be empty';
  // }
  // if (values.date_in !== null && values.date_out !== null) {
  //   if (typeof values.date_in === 'object' && values.date_in.isAfter(values.date_out)) {
  //     errors.date_out = 'date out shouldn’t less than date in';
  //   }
  // }
  // if (values.time_in !== null && values.time_out !== null) {
  //   if (typeof values.time_in === 'object' && values.time_in.isAfter(values.time_out)) {
  //     errors.time_out = 'time out shouldn’t less than time in';
  //   }
  // }
  const validation = {
    date_in: {
      fieldLabel: 'Date in',
      required: true,
    },
    date_out: {
      fieldLabel: 'Date out',
      required: true,
      lockDateAfter: 'date_in',
      fieldLabelBefore: 'Date in',
    },
    // time_in: {
    //   fieldLabel: 'Time in',
    //   required: true,
    // },
    // time_out: {
    //   fieldLabel: 'Time out',
    //   required: true,
    //   lockTimeAfter: 'time_in',
    //   fieldLabelBefore: 'Time in',
    // },
  };
  const errors = utils.validate(validation, values);
  return errors;
};
export default reduxForm({
  form: 'attmonitoringform',
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
  validate,
})(translate('global')(AttendanceMonitoring));
