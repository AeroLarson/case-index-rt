Convert the below HTML/CSS code into React component. Do not include the global components as these already exist:

<main id="main-content" style="margin-left:240px;min-height:100vh;background:linear-gradient(180deg,#0f0520 0%,#1a0b2e 100%);">
  <!-- Scrollable Top Section -->
  <div id="section-preview-header" style="padding:32px 24px; border-bottom: 1px solid rgba(167,139,250,0.2);">
    <div style="max-width:1200px;margin:0 auto;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <i style="color:#a78bfa;font-size:20px;" data-fa-i2svg="">
            <svg class="svg-inline--fa fa-gavel" style="color:#a78bfa;font-size:20px;" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="gavel" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg="">
              <path fill="currentColor" d="M318.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-120 120c-12.5 12.5-12.5 32.8 0 45.3l16 16c12.5 12.5 32.8 12.5 45.3 0l4-4L325.4 293.4l-4 4c-12.5 12.5-12.5 32.8 0 45.3l16 16c12.5 12.5 32.8 12.5 45.3 0l120-120c12.5-12.5 12.5-32.8 0-45.3l-16-16c-12.5-12.5-32.8-12.5-45.3 0l-4 4L330.6 74.6l4-4c12.5-12.5 12.5-32.8 0-45.3l-16-16zm-152 288c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l48 48c12.5 12.5 32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-1.4-1.4L272 285.3 226.7 240 168 298.7l-1.4-1.4z"></path>
            </svg>
          </i>
          <span style="color:#ffffff;font-size:16px;font-weight:600;">Case Index RT</span>
          <span style="background:rgba(167,139,250,0.2);color:#c4b5fd;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:500;">PREVIEW</span>
        </div>
        <div style="display:flex;align-items:center;gap:16px;">
          <button id="btn-sign-in" style="background:linear-gradient(135deg,#3730a3 0%,#5b21b6 100%);color:#ffffff;border:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;border:1px solid rgba(167,139,250,0.3);">
            Sign In
          </button>
          <span style="color:#9ca3af;font-size:14px;">Experience the dashboard</span>
        </div>
      </div>

      <!-- Preview Banner -->
      <div style="background:rgba(139,92,246,0.1);border:1px solid rgba(167,139,250,0.3);border-radius:12px;padding:24px;margin-bottom:32px;text-align:center;">
        <h1 style="color:#ffffff;font-size:32px;font-weight:700;margin:0 0 12px 0;">California Court Case Search</h1>
        <p style="color:#c4b5fd;font-size:18px;margin:0 0 20px 0;">Track family law cases, hearings, and filings across San Diego County</p>
        <p style="color:#9ca3af;font-size:14px;margin:0;">This is a preview of how your dashboard would look after creating an account</p>
      </div>
    </div>
  </div>

  <!-- Main Dashboard Content -->
  <div style="padding:32px 24px;">
    <div style="max-width:1200px;margin:0 auto;">
      
      <div id="section-overview" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;margin-bottom:32px;">
        <div id="card-active-cases" style="background:linear-gradient(135deg,#2d1b4e 0%,#3730a3 100%);border-radius:12px;padding:24px;border:1px solid rgba(167,139,250,0.2);">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
            <div style="width:48px;height:48px;background:rgba(139,92,246,0.2);border-radius:10px;display:flex;align-items:center;justify-content:center;">
              <i style="color:#a78bfa;font-size:24px;" data-fa-i2svg="">
                <svg class="svg-inline--fa fa-folder-open" style="color:#a78bfa;font-size:24px;" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="folder-open" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" data-fa-i2svg="">
                  <path fill="currentColor" d="M88.7 223.8L0 375.8V96C0 60.7 28.7 32 64 32H181.5c17 0 33.3 6.7 45.3 18.7l26.5 26.5c12 12 28.3 18.7 45.3 18.7H416c35.3 0 64 28.7 64 64v32H144c-22.8 0-43.8 12.1-55.3 31.8zm27.6 16.1C122.1 230 132.6 224 144 224H544c11.5 0 22 6.1 27.7 16.1s5.7 22.2-.1 32.1l-112 192C453.9 474 443.4 480 432 480H32c-11.5 0-22-6.1-27.7-16.1s-5.7-22.2 .1-32.1l112-192z"></path>
                </svg>
              </i>
            </div>
            <div style="flex:1;">
              <p style="color:#c4b5fd;font-size:13px;margin:0 0 4px 0;">Active Cases</p>
              <p style="color:#ffffff;font-size:28px;font-weight:700;margin:0;">847</p>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <i style="color:#10b981;font-size:12px;" data-fa-i2svg="">
              <svg class="svg-inline--fa fa-arrow-up" style="color:#10b981;font-size:12px;" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrow-up" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" data-fa-i2svg="">
                <path fill="currentColor" d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"></path>
              </svg>
            </i>
            <span style="color:#10b981;font-size:13px;font-weight:600;">+12.4%</span>
          </div>
        </div>

        <div id="card-upcoming-hearings" style="background:linear-gradient(135deg,#2d1b4e 0%,#3730a3 100%);border-radius:12px;padding:24px;border:1px solid rgba(167,139,250,0.2);">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
            <div style="width:48px;height:48px;background:rgba(139,92,246,0.2);border-radius:10px;display:flex;align-items:center;justify-content:center;">
              <i style="color:#a78bfa;font-size:24px;" data-fa-i2svg="">
                <svg class="svg-inline--fa fa-calendar-days" style="color:#a78bfa;font-size:24px;" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="calendar-days" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg="">
                  <path fill="currentColor" d="M128 0c17.7 0 32 14.3 32 32V64H288V32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h48c26.5 0 48 21.5 48 48v48H0V112C0 85.5 21.5 64 48 64H96V32c0-17.7 14.3-32 32-32zM0 192H448V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zm64 80c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V272zm128 0c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H208c-8.8 0-16-7.2-16-16V272zm144-16c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H336c-8.8 0-16-7.2-16-16V272c0-8.8 7.2-16 16-16h32zM64 400c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V400zm144-16c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V400c0-8.8 7.2-16 16-16h32zm112 16c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H336c-8.8 0-16-7.2-16-16V400z"></path>
                </svg>
              </i>
            </div>
            <div style="flex:1;">
              <p style="color:#c4b5fd;font-size:13px;margin:0 0 4px 0;">Upcoming Hearings</p>
              <p style="color:#ffffff;font-size:28px;font-weight:700;margin:0;">23</p>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <i style="color:#10b981;font-size:12px;" data-fa-i2svg="">
              <svg class="svg-inline--fa fa-arrow-up" style="color:#10b981;font-size:12px;" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrow-up" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" data-fa-i2svg="">
                <path fill="currentColor" d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"></path>
              </svg>
            </i>
            <span style="color:#10b981;font-size:13px;font-weight:600;">+5.7%</span>
          </div>
        </div>

        <div id="card-new-filings" style="background:linear-gradient(135deg,#2d1b4e 0%,#3730a3 100%);border-radius:12px;padding:24px;border:1px solid rgba(167,139,250,0.2);">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
            <div style="width:48px;height:48px;background:rgba(139,92,246,0.2);border-radius:10px;display:flex;align-items:center;justify-content:center;">
              <i style="color:#a78bfa;font-size:24px;" data-fa-i2svg="">
                <svg class="svg-inline--fa fa-file-lines" style="color:#a78bfa;font-size:24px;" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="file-lines" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" data-fa-i2svg="">
                  <path fill="currentColor" d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM112 256H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16z"></path>
                </svg>
              </i>
            </div>
            <div style="flex:1;">
              <p style="color:#c4b5fd;font-size:13px;margin:0 0 4px 0;">New Filings</p>
              <p style="color:#ffffff;font-size:28px;font-weight:700;margin:0;">156</p>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <i style="color:#ef4444;font-size:12px;" data-fa-i2svg="">
              <svg class="svg-inline--fa fa-arrow-down" style="color:#ef4444;font-size:12px;" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrow-down" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" data-fa-i2svg="">
                <path fill="currentColor" d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"></path>
              </svg>
            </i>
            <span style="color:#ef4444;font-size:13px;font-weight:600;">-2.3%</span>
          </div>
        </div>
      </div>

      <div id="section-case-updates" style="background:linear-gradient(135deg,#1a0b2e 0%,#2d1b4e 100%);border-radius:16px;padding:32px;border:1px solid rgba(167,139,250,0.2);margin-bottom:32px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
          <h2 style="color:#ffffff;font-size:20px;font-weight:600;margin:0;">Recent Case Updates</h2>
          <div style="display:flex;gap:12px;align-items:center;">
            <select style="background: rgb(55, 48, 163); color: rgb(255, 255, 255); border: 1px solid rgba(167, 139, 250, 0.3); border-radius: 6px; padding: 6px 12px; font-size: 13px;">
              <option>All Counties</option>
              <option>San Diego</option>
              <option>Orange County</option>
            </select>
            <select style="background: rgb(55, 48, 163); color: rgb(255, 255, 255); border: 1px solid rgba(167, 139, 250, 0.3); border-radius: 6px; padding: 6px 12px; font-size: 13px;">
              <option>Family Law</option>
              <option>Civil</option>
              <option>Criminal</option>
            </select>
          </div>
        </div>
        <div style="display:grid;gap:16px;">
          <div style="background:rgba(139,92,246,0.1);border:1px solid rgba(167,139,250,0.2);border-radius:12px;padding:20px;">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px;">
              <div style="display:flex;align-items:center;gap:12px;">
                <div style="width:8px;height:8px;background:#10b981;border-radius:50%;"></div>
                <h3 style="color:#ffffff;font-size:16px;font-weight:600;margin:0;">Smith v. Johnson</h3>
                <span style="background:rgba(167,139,250,0.2);color:#c4b5fd;padding:4px 8px;border-radius:6px;font-size:12px;">FL-2024-001234</span>
              </div>
              <span style="color:#9ca3af;font-size:13px;">2 hours ago</span>
            </div>
            <p style="color:#c4b5fd;font-size:14px;margin:0 0 12px 20px;">New motion for temporary custody filed by petitioner. Hearing scheduled for March 15, 2024.</p>
            <div style="display:flex;justify-content:between;align-items:center;margin-left:20px;">
              <span style="color:#9ca3af;font-size:12px;">San Diego Superior Court • Judge Martinez</span>
            </div>
          </div>
          <div style="background:rgba(139,92,246,0.1);border:1px solid rgba(167,139,250,0.2);border-radius:12px;padding:20px;">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px;">
              <div style="display:flex;align-items:center;gap:12px;">
                <div style="width:8px;height:8px;background:#f59e0b;border-radius:50%;"></div>
                <h3 style="color:#ffffff;font-size:16px;font-weight:600;margin:0;">Rodriguez v. Martinez</h3>
                <span style="background:rgba(167,139,250,0.2);color:#c4b5fd;padding:4px 8px;border-radius:6px;font-size:12px;">FL-2024-001189</span>
              </div>
              <span style="color:#9ca3af;font-size:13px;">4 hours ago</span>
            </div>
            <p style="color:#c4b5fd;font-size:14px;margin:0 0 12px 20px;">Court order issued regarding child support modification. Payment schedule updated effective immediately.</p>
            <div style="display:flex;justify-content:between;align-items:center;margin-left:20px;">
              <span style="color:#9ca3af;font-size:12px;">San Diego Superior Court • Judge Chen</span>
            </div>
          </div>
          <div style="background:rgba(139,92,246,0.1);border:1px solid rgba(167,139,250,0.2);border-radius:12px;padding:20px;">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px;">
              <div style="display:flex;align-items:center;gap:12px;">
                <div style="width:8px;height:8px;background:#ef4444;border-radius:50%;"></div>
                <h3 style="color:#ffffff;font-size:16px;font-weight:600;margin:0;">Thompson v. Wilson</h3>
                <span style="background:rgba(167,139,250,0.2);color:#c4b5fd;padding:4px 8px;border-radius:6px;font-size:12px;">FL-2024-000987</span>
              </div>
              <span style="color:#9ca3af;font-size:13px;">6 hours ago</span>
            </div>
            <p style="color:#c4b5fd;font-size:14px;margin:0 0 12px 20px;">Hearing postponed due to attorney conflict. New date to be scheduled within 30 days.</p>
            <div style="display:flex;justify-content:between;align-items:center;margin-left:20px;">
              <span style="color:#9ca3af;font-size:12px;">San Diego Superior Court • Judge Williams</span>
            </div>
          </div>
        </div>
      </div>

      <div id="section-upcoming-hearings" style="background:linear-gradient(135deg,#1a0b2e 0%,#2d1b4e 100%);border-radius:16px;padding:32px;border:1px solid rgba(167,139,250,0.2);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
          <h2 style="color:#ffffff;font-size:20px;font-weight:600;margin:0;">Upcoming Hearings</h2>
          <div style="display:flex;gap:12px;align-items:center;">
            <select style="background: rgb(55, 48, 163); color: rgb(255, 255, 255); border: 1px solid rgba(167, 139, 250, 0.3); border-radius: 6px; padding: 6px 12px; font-size: 13px;">
              <option>Next 7 Days</option>
              <option>Next 30 Days</option>
              <option>This Month</option>
            </select>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;">
          <div style="background:rgba(139,92,246,0.1);border:1px solid rgba(167,139,250,0.2);border-radius:12px;padding:20px;">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:16px;">
              <div>
                <h3 style="color:#ffffff;font-size:16px;font-weight:600;margin:0 0 4px 0;">Davis v. Anderson</h3>
                <span style="color:#c4b5fd;font-size:13px;">FL-2024-001456</span>
              </div>
              <div style="text-align:right;">
                <span style="color:#10b981;font-size:14px;font-weight:600;">Mar 12, 2024</span><br>
                <span style="color:#9ca3af;font-size:12px;">9:00 AM</span>
              </div>
            </div>
            <p style="color:#c4b5fd;font-size:14px;margin:0 0 12px 0;">Motion for Temporary Orders - Child Custody and Support</p>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="color:#9ca3af;font-size:12px;">Dept. 12 • Judge Roberts</span>
              <span style="background:rgba(16,185,129,0.2);color:#10b981;padding:2px 6px;border-radius:4px;font-size:11px;">Confirmed</span>
            </div>
          </div>
          <div style="background:rgba(139,92,246,0.1);border:1px solid rgba(167,139,250,0.2);border-radius:12px;padding:20px;">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:16px;">
              <div>
                <h3 style="color:#ffffff;font-size:16px;font-weight:600;margin:0 0 4px 0;">Miller v. Garcia</h3>
                <span style="color:#c4b5fd;font-size:13px;">FL-2024-001298</span>
              </div>
              <div style="text-align:right;">
                <span style="color:#10b981;font-size:14px;font-weight:600;">Mar 14, 2024</span><br>
                <span style="color:#9ca3af;font-size:12px;">2:30 PM</span>
              </div>
            </div>
            <p style="color:#c4b5fd;font-size:14px;margin:0 0 12px 0;">Final Status Conference - Dissolution of Marriage</p>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="color:#9ca3af;font-size:12px;">Dept. 8 • Judge Thompson</span>
              <span style="background:rgba(245,158,11,0.2);color:#f59e0b;padding:2px 6px;border-radius:4px;font-size:11px;">Pending</span>
            </div>
          </div>
          <div style="background:rgba(139,92,246,0.1);border:1px solid rgba(167,139,250,0.2);border-radius:12px;padding:20px;">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:16px;">
              <div>
                <h3 style="color:#ffffff;font-size:16px;font-weight:600;margin:0 0 4px 0;">Brown v. Lee</h3>
                <span style="color:#c4b5fd;font-size:13px;">FL-2024-001567</span>
              </div>
              <div style="text-align:right;">
                <span style="color:#10b981;font-size:14px;font-weight:600;">Mar 15, 2024</span><br>
                <span style="color:#9ca3af;font-size:12px;">10:15 AM</span>
              </div>
            </div>
            <p style="color:#c4b5fd;font-size:14px;margin:0 0 12px 0;">Custody Modification Hearing</p>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="color:#9ca3af;font-size:12px;">Dept. 15 • Judge Martinez</span>
              <span style="background:rgba(16,185,129,0.2);color:#10b981;padding:2px 6px;border-radius:4px;font-size:11px;">Confirmed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Sign In Modal -->
  <div id="modal-sign-in" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:1000;align-items:center;justify-content:center;">
    <div style="background:linear-gradient(135deg,#1a0b2e 0%,#2d1b4e 100%);border-radius:16px;padding:32px;max-width:400px;width:90%;border:1px solid rgba(167,139,250,0.2);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
        <h3 style="color:#ffffff;font-size:20px;font-weight:600;margin:0;">Sign In to Case Index RT</h3>
        <button id="btn-close-modal" style="background:none;border:none;color:#9ca3af;font-size:20px;cursor:pointer;">×</button>
      </div>
      
      <div style="display:grid;gap:12px;margin-bottom:24px;">
        <button style="display:flex;align-items:center;justify-content:center;gap:12px;background:white;color:#374151;border:1px solid #d1d5db;border-radius:8px;padding:12px;font-size:14px;font-weight:500;cursor:pointer;width:100%;">
          <i class="fa-brands fa-google" style="color:#ea4335;font-size:16px;"></i>
          Continue with Google
        </button>
        <button style="display:flex;align-items:center;justify-content:center;gap:12px;background:#000000;color:#ffffff;border:1px solid #374151;border-radius:8px;padding:12px;font-size:14px;font-weight:500;cursor:pointer;width:100%;">
          <i class="fa-brands fa-apple" style="color:#ffffff;font-size:16px;"></i>
          Continue with Apple
        </button>
        <button style="display:flex;align-items:center;justify-content:center;gap:12px;background:#1877f2;color:#ffffff;border:1px solid #1877f2;border-radius:8px;padding:12px;font-size:14px;font-weight:500;cursor:pointer;width:100%;">
          <i class="fa-brands fa-facebook" style="color:#ffffff;font-size:16px;"></i>
          Continue with Facebook
        </button>
      </div>

      <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
        <div style="flex:1;height:1px;background:rgba(167,139,250,0.2);"></div>
        <span style="color:#9ca3af;font-size:14px;">or</span>
        <div style="flex:1;height:1px;background:rgba(167,139,250,0.2);"></div>
      </div>

      <div style="display:grid;gap:16px;">
        <div>
          <label style="color:#c4b5fd;font-size:14px;display:block;margin-bottom:6px;">Email</label>
          <input type="email" style="background:white;border:1px solid rgba(167,139,250,0.3);border-radius:8px;padding:12px;width:100%;font-size:14px;" placeholder="Enter your email">
        </div>
        <div>
          <label style="color:#c4b5fd;font-size:14px;display:block;margin-bottom:6px;">Password</label>
          <input type="password" style="background:white;border:1px solid rgba(167,139,250,0.3);border-radius:8px;padding:12px;width:100%;font-size:14px;" placeholder="Enter your password">
        </div>
        <button style="background:linear-gradient(135deg,#3730a3 0%,#5b21b6 100%);color:#ffffff;border:none;padding:12px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;width:100%;">
          Sign In
        </button>
      </div>

      <div style="text-align:center;margin-top:20px;">
        <p style="color:#9ca3af;font-size:14px;margin:0;">Don't have an account? <a href="#" style="color:#a78bfa;text-decoration:none;">Sign up</a></p>
      </div>
    </div>
  </div>

  <script>
    document.getElementById('btn-sign-in').addEventListener('click', function() {
      document.getElementById('modal-sign-in').style.display = 'flex';
    });
    
    document.getElementById('btn-close-modal').addEventListener('click', function() {
      document.getElementById('modal-sign-in').style.display = 'none';
    });
    
    document.getElementById('modal-sign-in').addEventListener('click', function(e) {
      if (e.target === this) {
        this.style.display = 'none';
      }
    });
  </script>
</main>