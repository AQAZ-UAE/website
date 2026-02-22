import os

# Load the base template
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Markers for injection
header_tag = '</header>'
footer_tag = '<footer'

h_end = html.find(header_tag)
if h_end != -1:
    h_end += len(header_tag)
else:
    # Fallback if header tag is missing or different
    h_end = html.find('</nav>') + 6

f_start = html.find(footer_tag)
if f_start == -1:
    # Fallback for footer
    f_start = html.find('<div class="footer')

login_body = """
    <!-- Login Area -->
    <main class="container my-5" style="min-height: 70vh; display: flex; align-items: center; justify-content: center;">
        <div class="card shadow-lg border-0" style="max-width: 450px; width: 100%; border-radius: 12px; overflow: hidden;">
            <div class="card-header bg-white border-0 text-center pt-5 pb-2">
                <i class="fa-regular fa-user-circle fa-4x mb-3" style="color: #1a2b4b;"></i>
                <h3 class="fw-bold" style="color: #1a2b4b;">Welcome Back</h3>
                <p class="text-muted mb-0">Sign in to access your account</p>
            </div>
            <div class="card-body p-4 pt-2 pb-5">
                <form id="loginForm">
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-muted small">Email Address</label>
                        <input type="email" class="form-control" id="loginEmail" placeholder="name@example.com" required style="padding: 12px; border-radius: 8px;">
                    </div>
                    <div class="mb-4">
                        <div class="d-flex justify-content-between">
                             <label class="form-label fw-semibold text-muted small">Password</label>
                             <a href="#" style="font-size: 0.8rem; text-decoration: none; color: #ff6b00;">Forgot Password?</a>
                        </div>
                        <input type="password" class="form-control" id="loginPassword" placeholder="••••••••" required style="padding: 12px; border-radius: 8px;">
                    </div>
                    <button type="submit" class="btn w-100 fw-bold shadow-sm" style="background: #1a2b4b; color: white; border-radius: 8px; padding: 12px;">Sign In</button>
                    <div class="text-center mt-4 text-muted small">
                        Don't have an account? <a href="register.html" class="fw-bold" style="color: #007185; text-decoration: none;">Create Account</a>
                    </div>
                </form>
            </div>
        </div>
    </main>
"""

register_body = """
    <!-- Register Area -->
    <main class="container my-5" style="min-height: 70vh; display: flex; align-items: center; justify-content: center;">
        <div class="card shadow-lg border-0" style="max-width: 500px; width: 100%; border-radius: 12px; overflow: hidden;">
            <div class="card-header bg-white border-0 text-center pt-5 pb-2">
                <i class="fa-solid fa-user-plus fa-3x mb-3" style="color: #1a2b4b;"></i>
                <h3 class="fw-bold" style="color: #1a2b4b;">Create Account</h3>
                <p class="text-muted mb-0">Join AQAZ to manage your wishlist and fast checkout</p>
            </div>
            <div class="card-body p-4 pt-2 pb-5">
                <form id="registerForm">
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-muted small">Full Name</label>
                        <input type="text" class="form-control" id="regName" placeholder="John Doe" required style="padding: 12px; border-radius: 8px;">
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold text-muted small">Email Address</label>
                        <input type="email" class="form-control" id="regEmail" placeholder="name@example.com" required style="padding: 12px; border-radius: 8px;">
                    </div>
                    <div class="mb-4">
                        <label class="form-label fw-semibold text-muted small">Password</label>
                        <input type="password" class="form-control" id="regPassword" placeholder="Minimum 6 characters" required minlength="6" style="padding: 12px; border-radius: 8px;">
                    </div>
                    <button type="submit" class="btn w-100 fw-bold shadow-sm" style="background: #ff6b00; color: white; border-radius: 8px; padding: 12px;">Create Account</button>
                    <div class="text-center mt-4 text-muted small">
                        Already have an account? <a href="login.html" class="fw-bold" style="color: #007185; text-decoration: none;">Sign In</a>
                    </div>
                </form>
            </div>
        </div>
    </main>
"""

def build_page(body):
    return html[:h_end] + body + html[f_start:]

login_html = build_page(login_body)
register_html = build_page(register_body)

# Since index.html now includes js/auth.js by default, we don't need to replace js/render.js
# But we might want to disable render.js on login/register pages to avoid errors
login_html = login_html.replace('<script src="js/render.js"></script>', '<!-- render.js disabled -->')
register_html = register_html.replace('<script src="js/render.js"></script>', '<!-- render.js disabled -->')

with open('login.html', 'w', encoding='utf-8') as f:
    f.write(login_html)

with open('register.html', 'w', encoding='utf-8') as f:
    f.write(register_html)

print("Re-built login.html and register.html with correct footer and auth.js support.")
